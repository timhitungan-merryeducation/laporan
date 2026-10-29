import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { action } = req.method === 'POST' ? req.body : req.query;

    // --- GET ACTIONS (MEMBACA DATA) ---
    if (req.method === 'GET') {
      if (action === 'getSiswaDashboardStats') {
        const rs = await client.execute(`SELECT nama, kelas, sekolah, guru_wali as guruWali FROM siswa ORDER BY nama ASC`);
        return res.status(200).json({ status: 'success', data: rs.rows });
      }

      if (action === 'getGuru') {
        const rs = await client.execute(`SELECT nama FROM guru ORDER BY nama ASC`);
        return res.status(200).json({ status: 'success', data: rs.rows.map(r => r.nama) });
      }

      if (action === 'getStudentsWithExistingGrades') {
        const { guru, tahun, semester, mapel } = req.query;
        // Ambil siswa binaan guru tersebut
        const siswa = await client.execute({
          sql: `SELECT nama, kelas FROM siswa WHERE guru_wali LIKE ? ORDER BY nama ASC`,
          args: [`%${guru}%`]
        });
        
        // Ambil nilai mereka (jika ada)
        const nilai = await client.execute({
          sql: `SELECT * FROM nilai WHERE tahun = ? AND semester = ? AND mapel LIKE ?`,
          args: [tahun, semester, `%${mapel || ''}%`]
        });

        const dataSiswa = siswa.rows.map(s => {
          const n = nilai.rows.find(row => row.nama_siswa.toLowerCase() === s.nama.toLowerCase()) || {};
          return {
            nama: s.nama, kelas: s.kelas,
            u1: n.u1 || '', u2: n.u2 || '', u3: n.u3 || '', u4: n.u4 || '', 
            sts: n.sts || '', sas: n.sas || '', rapor: n.rapor || ''
          };
        });
        return res.status(200).json({ status: 'success', data: dataSiswa });
      }

      if (action === 'getRaportIndividu') {
        const rs = await client.execute({
          sql: `SELECT file_url as url, tahun_pelajaran as tahun, jenis_raport as jenis FROM raport WHERE nama_siswa = ? ORDER BY created_at DESC`,
          args: [req.query.nama]
        });
        return res.status(200).json({ status: 'success', data: rs.rows });
      }

      if (action === 'getRaportGlobal') {
        const rs = await client.execute({
          sql: `SELECT file_url as url FROM raport WHERE tahun_pelajaran = ? AND jenis_raport = ?`,
          args: [req.query.tahun, req.query.jenis]
        });
        return res.status(200).json({ status: 'success', data: rs.rows });
      }
    }

    // --- POST ACTIONS (MENYIMPAN DATA) ---
    if (req.method === 'POST') {
      const payload = req.body;

      if (action === 'saveSingleGrade') {
        const { tahun, semester, nama, kelas, mapel, guruPengajar, field, value } = payload;
        
        // Cek apakah nilai siswa di semester ini sudah ada
        const cek = await client.execute({
          sql: `SELECT id FROM nilai WHERE tahun = ? AND semester = ? AND nama_siswa = ? AND mapel = ?`,
          args: [tahun, semester, nama, mapel]
        });

        if (cek.rows.length > 0) {
          // Update jika sudah ada
          await client.execute({
            sql: `UPDATE nilai SET ${field.toLowerCase()} = ?, guru_pengajar = ? WHERE id = ?`,
            args: [value, guruPengajar, cek.rows[0].id]
          });
        } else {
          // Insert baru
          await client.execute({
            sql: `INSERT INTO nilai (tahun, semester, nama_siswa, kelas, mapel, guru_pengajar, ${field.toLowerCase()}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [tahun, semester, nama, kelas, mapel, guruPengajar, value]
          });
        }
        return res.status(200).json({ status: 'success', data: 'OK' });
      }

      if (action === 'saveRaportData') {
        const { namaSiswa, kelas, jenisRaport, tahunPelajaran, fileId, fileUrl, namaFile } = payload;
        await client.execute({
          sql: `INSERT INTO raport (nama_siswa, kelas, jenis_raport, tahun_pelajaran, file_id, file_url, nama_file) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [namaSiswa, kelas, jenisRaport, tahunPelajaran, fileId, fileUrl, namaFile]
        });
        return res.status(200).json({ status: 'success', data: 'OK' });
      }
    }
    
    return res.status(404).json({ status: 'error', message: 'Action not found' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

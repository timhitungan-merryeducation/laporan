import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { action } = req.method === 'POST' ? req.body : req.query;

    if (req.method === 'GET') {
      
      // 1. Dashboard Utama
      if (action === 'getDashboardStats') {
        const guru = await client.execute(`SELECT COUNT(*) as count FROM guru`);
        const siswa = await client.execute(`SELECT COUNT(*) as count FROM siswa`);
        return res.status(200).json({ 
          status: 'success', 
          data: {
            countGuru: guru.rows[0].count,
            countSiswa: siswa.rows[0].count,
            countFiles: 0,
            jadwal: []
          }
        });
      }

      // 2. Data Guru untuk Dropdown
      if (action === 'getGuru') {
        const rs = await client.execute(`SELECT nama_guru FROM guru ORDER BY nama_guru ASC`);
        return res.status(200).json({ status: 'success', data: rs.rows.map(r => r.nama_guru) });
      }

      // 3. Halaman Data Guru (Beserta Jumlah Siswa) - INI YANG MEMPERBAIKI ERROR ANDA
      if (action === 'getGuruDashboardStats') {
        // Ambil semua guru
        const guruRs = await client.execute(`SELECT nama_guru, mata_pelajaran FROM guru`);
        // Ambil semua siswa untuk dihitung
        const siswaRs = await client.execute(`SELECT nama_siswa, asal_sekolah, guru_wali FROM siswa`);
        
        const guruData = guruRs.rows.map(g => {
          const myStudents = siswaRs.rows.filter(s => s.guru_wali && s.guru_wali.toLowerCase() === g.nama_guru.toLowerCase());
          const listNamaSiswa = myStudents.map(s => `${s.nama_siswa} (${s.asal_sekolah})`);
          
          return {
            nama: g.nama_guru,
            mapel: g.mata_pelajaran,
            jumlahSiswa: myStudents.length,
            waliMurid: listNamaSiswa.length > 0 ? listNamaSiswa.join(', ') : 'Belum ada siswa binaan'
          };
        });
        
        return res.status(200).json({ status: 'success', data: guruData });
      }

      // 4. Halaman Data Siswa
      if (action === 'getSiswaDashboardStats') {
        const rs = await client.execute(`SELECT nama_siswa as nama, kelas, asal_sekolah as sekolah, guru_wali as guruWali FROM siswa ORDER BY nama_siswa ASC`);
        return res.status(200).json({ status: 'success', data: rs.rows });
      }

      // 5. Data Siswa beserta Nilai (Untuk Input Nilai & Progress)
      if (action === 'getStudentsWithExistingGrades') {
        const { guru, tahun, semester, mapel } = req.query;
        
        const siswa = await client.execute({
          sql: `SELECT nama_siswa, kelas FROM siswa WHERE guru_wali LIKE ? ORDER BY nama_siswa ASC`,
          args: [`%${guru}%`]
        });
        
        const nilai = await client.execute({
          sql: `SELECT * FROM nilai WHERE tahun_ajaran = ? AND semester = ? AND mata_pelajaran LIKE ?`,
          args: [tahun, semester, `%${mapel || ''}%`]
        });

        const dataSiswa = siswa.rows.map(s => {
          const n = nilai.rows.find(row => row.nama_siswa.toLowerCase() === s.nama_siswa.toLowerCase()) || {};
          return {
            nama: s.nama_siswa, kelas: s.kelas,
            u1: n.u1 || '', u2: n.u2 || '', u3: n.u3 || '', u4: n.u4 || '', 
            u5: n.u5 || '', u6: n.u6 || '',
            sts: n.sts || '', sas: n.sas_sat || '', rapor: n.rapor || ''
          };
        });
        return res.status(200).json({ status: 'success', data: dataSiswa });
      }

      // 6. Raport Individu
      if (action === 'getRaportIndividu') {
        const rs = await client.execute({
          sql: `SELECT file_url as url, tahun_pelajaran as tahun, jenis_raport as jenis FROM raport_siswa WHERE nama_siswa = ? ORDER BY timestamp DESC`,
          args: [req.query.nama]
        });
        return res.status(200).json({ status: 'success', data: rs.rows });
      }

      // 7. Raport Global
      if (action === 'getRaportGlobal') {
        const rs = await client.execute({
          sql: `SELECT file_url as url FROM raport_siswa WHERE tahun_pelajaran = ? AND jenis_raport = ?`,
          args: [req.query.tahun, req.query.jenis]
        });
        return res.status(200).json({ status: 'success', data: rs.rows });
      }
      
      // 8. Rekapitulasi dengan Chart
      if (action === 'getRekapNilaiWithChart') {
        const rs = await client.execute(`SELECT * FROM nilai`);
        const processed = rs.rows.map(row => {
          return { 
            display: [row.nama_siswa, row.kelas, row.mata_pelajaran, row.guru_pengajar || "-", row.u1, row.u2, row.u3, row.u4, row.u5, row.u6, row.sts, row.sas_sat, row.rapor, row.rata_rata], 
            nama: row.nama_siswa, 
            rata: row.rata_rata || 0 
          };
        });
        return res.status(200).json({ 
          status: 'success', 
          data: { table: processed.map(p => p.display), chartLabels: processed.map(p => p.nama), chartValues: processed.map(p => p.rata), statistik: { total: rs.rows.length, bawah75: 0, persen: 0 } } 
        });
      }
    }

    if (req.method === 'POST') {
      const payload = req.body;

      if (action === 'saveSingleGrade') {
        const { tahun, semester, nama, kelas, mapel, guruPengajar, field, value } = payload;
        
        let dbField = field.toLowerCase();
        if (dbField === 'sas') dbField = 'sas_sat'; // Mapping nama kolom

        const cek = await client.execute({
          sql: `SELECT id FROM nilai WHERE tahun_ajaran = ? AND semester = ? AND nama_siswa = ? AND mata_pelajaran = ?`,
          args: [tahun, semester, nama, mapel]
        });

        if (cek.rows.length > 0) {
          await client.execute({
            sql: `UPDATE nilai SET ${dbField} = ?, guru_pengajar = ? WHERE id = ?`,
            args: [value, guruPengajar, cek.rows[0].id]
          });
        } else {
          await client.execute({
            sql: `INSERT INTO nilai (tahun_ajaran, semester, nama_siswa, kelas, mata_pelajaran, guru_pengajar, ${dbField}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [tahun, semester, nama, kelas, mapel, guruPengajar, value]
          });
        }
        return res.status(200).json({ status: 'success', data: 'OK' });
      }

      if (action === 'saveRaportData') {
        const { namaSiswa, kelas, jenisRaport, tahunPelajaran, fileId, fileUrl, namaFile } = payload;
        await client.execute({
          sql: `INSERT INTO raport_siswa (nama_siswa, kelas, jenis_raport, tahun_pelajaran, file_id, file_url, nama_file) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

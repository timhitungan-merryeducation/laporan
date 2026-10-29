import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    if (req.method === 'POST') {
      const { namaSiswa, kelas, jenisRaport, tahunPelajaran, fileId, fileUrl, namaFile } = req.body;
      const result = await client.execute({
        sql: `INSERT INTO raport_siswa (nama_siswa, kelas, jenis_raport, tahun_pelajaran, file_id, file_url, nama_file) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [namaSiswa, kelas || '-', jenisRaport, tahunPelajaran, fileId, fileUrl, namaFile],
      });
      return res.status(200).json({ status: 'success', id: result.lastInsertRowid });
    } 
    
    if (req.method === 'GET') {
      const { action, nama, tahun, jenis } = req.query;

      if (action === 'getIndividu') {
        const result = await client.execute({
          sql: `SELECT file_url as url, tahun_pelajaran as tahun, jenis_raport as jenis FROM raport_siswa WHERE nama_siswa = ? ORDER BY created_at DESC`,
          args: [nama],
        });
        return res.status(200).json({ status: 'success', data: result.rows });
      }

      if (action === 'getGlobal') {
        const result = await client.execute({
          sql: `SELECT file_url as url FROM raport_siswa WHERE tahun_pelajaran = ? AND jenis_raport = ?`,
          args: [tahun, jenis],
        });
        return res.status(200).json({ status: 'success', data: result.rows });
      }
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

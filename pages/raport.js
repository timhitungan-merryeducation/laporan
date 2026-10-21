import { useState } from 'react';
import Layout from '../components/Layout';
import { poster, fetcher } from '../utils/api';
import { downloadMergedRaport } from '../utils/pdfProcessor';
import useSWR from 'swr';

export default function RaportManager() {
  const [file, setFile] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [jenisRaport, setJenisRaport] = useState('Sisipan');
  const [isUploading, setIsUploading] = useState(false);

  // Ambil data raport siswa jika nama sudah diisi
  const { data: raportSiswa } = useSWR(
    namaSiswa ? ['getRaport', { namaSiswa }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !namaSiswa) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const payload = {
        namaSiswa,
        jenisRaport,
        kelas: "Automatis", // Bisa disesuaikan dari data siswa
        fileName: file.name,
        base64: event.target.result,
      };
      await poster('uploadRaport', payload);
      alert('Raport berhasil diunggah!');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadGabungan = async () => {
    if (!raportSiswa || raportSiswa.length === 0) return alert('Belum ada raport untuk siswa ini.');
    const urls = raportSiswa.map(r => r.url);
    await downloadMergedRaport(urls, namaSiswa);
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Manajemen Raport Siswa</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="font-bold mb-4">Upload Raport (PDF / Foto)</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Nama Lengkap Siswa" className="border p-2 rounded" value={namaSiswa} onChange={(e) => setNamaSiswa(e.target.value)} required />
          <select className="border p-2 rounded" value={jenisRaport} onChange={(e) => setJenisRaport(e.target.value)}>
            <option value="Sisipan">Raport Sisipan</option>
            <option value="Semester">Raport Semester</option>
          </select>
          <input type="file" accept=".pdf, image/*" className="border p-2 rounded col-span-2" onChange={(e) => setFile(e.target.files[0])} required />
          <button type="submit" disabled={isUploading} className="bg-blue-600 text-white p-2 rounded col-span-2 hover:bg-blue-700 disabled:opacity-50">
            {isUploading ? 'Mengunggah...' : 'Upload Raport'}
          </button>
        </form>
      </div>

      {namaSiswa && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Arsip Raport: {namaSiswa}</h3>
            <button onClick={handleDownloadGabungan} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Download Gabungan (Utuh)
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Jenis</th>
                <th className="p-2 border">Waktu Upload</th>
                <th className="p-2 border">File</th>
              </tr>
            </thead>
            <tbody>
              {raportSiswa?.length > 0 ? raportSiswa.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border">{r.jenis}</td>
                  <td className="p-2 border">{new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                  <td className="p-2 border"><a href={r.url} target="_blank" className="text-blue-500 underline">Lihat File</a></td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="text-center p-4">Data kosong</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

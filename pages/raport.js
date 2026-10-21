import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { poster, fetcher } from '../utils/api';
import { downloadMergedRaport } from '../utils/pdfProcessor';

export default function RaportManager() {
  const [file, setFile] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [searchName, setSearchName] = useState('');
  const [jenisRaport, setJenisRaport] = useState('Sisipan');
  const [tahunPelajaran, setTahunPelajaran] = useState('2025/2026');
  const [filterTahun, setFilterTahun] = useState(''); // Untuk filter tabel
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ambil daftar seluruh siswa untuk autocomplete
  const { data: listSiswa } = useSWR('getSiswaDashboardStats', fetcher);
  
  // Ambil data raport siswa jika nama sudah dikonfirmasi
  const { data: raportSiswa, mutate } = useSWR(
    namaSiswa ? ['getRaport', { namaSiswa, tahun: filterTahun }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  // Logic Autocomplete Siswa
  const filteredStudents = useMemo(() => {
    if (!listSiswa || !searchName) return [];
    return listSiswa.filter(s => s.nama.toLowerCase().includes(searchName.toLowerCase())).slice(0, 5);
  }, [listSiswa, searchName]);

  const selectStudent = (name) => {
    setNamaSiswa(name);
    setSearchName(name);
    setShowSuggestions(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !namaSiswa) return alert('Nama Siswa dan File wajib diisi.');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const payload = {
        namaSiswa,
        jenisRaport,
        tahunPelajaran,
        kelas: "-", 
        fileName: file.name,
        base64: event.target.result,
      };
      await poster('uploadRaport', payload);
      alert('Raport berhasil diunggah!');
      setIsUploading(false);
      setFile(null);
      mutate(); // Refresh tabel
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadGabungan = async () => {
    if (!raportSiswa || raportSiswa.length === 0) return alert('Belum ada raport untuk siswa ini di tahun yang dipilih.');
    const urls = raportSiswa.map(r => r.url);
    await downloadMergedRaport(urls, namaSiswa);
  };

  return (
    <Layout>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Raport Siswa</h2>
        <p className="text-slate-500 mt-1">Unggah, filter, dan gabungkan raport PDF/Foto siswa.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Upload */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Upload Raport Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Cari Nama Siswa</label>
              <input 
                type="text" 
                placeholder="Mulai ketik nama..." 
                className="w-full border p-2 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={searchName} 
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setNamaSiswa('');
                  setShowSuggestions(true);
                }} 
                required 
              />
              {/* Dropdown Rekomendasi Siswa */}
              {showSuggestions && filteredStudents.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredStudents.map((s, i) => (
                    <li key={i} className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b" onClick={() => selectStudent(s.nama)}>
                      <span className="font-bold">{s.nama}</span> <span className="text-xs text-gray-400">({s.sekolah})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
              <select className="w-full border p-2 rounded-lg bg-slate-50 focus:ring-2 outline-none" value={tahunPelajaran} onChange={(e) => setTahunPelajaran(e.target.value)}>
                <option>2024/2025</option><option>2025/2026</option><option>2026/2027</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Jenis Raport</label>
              <select className="w-full border p-2 rounded-lg bg-slate-50 focus:ring-2 outline-none" value={jenisRaport} onChange={(e) => setJenisRaport(e.target.value)}>
                <option value="Sisipan">Raport Sisipan</option>
                <option value="Semester">Raport Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">File (PDF/Gambar)</label>
              <input type="file" accept=".pdf, image/*" className="w-full border p-1.5 rounded-lg bg-slate-50 text-sm" onChange={(e) => setFile(e.target.files[0])} required />
            </div>

            <button type="submit" disabled={isUploading || !namaSiswa} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2 flex justify-center items-center gap-2">
               {isUploading ? 'Mengunggah...' : <><i className="fas fa-cloud-upload-alt"></i> Upload Raport</>}
            </button>
            {!namaSiswa && searchName && <p className="text-xs text-red-500 text-center mt-1">Silakan pilih nama siswa dari daftar dropdown.</p>}
          </form>
        </div>

        {/* Tabel Arsip Raport */}
        <div className="lg:col-span-2">
          {namaSiswa ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-end border-b pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Arsip Raport Siswa</h3>
                  <p className="text-blue-600 font-semibold">{namaSiswa}</p>
                </div>
                
                <div className="flex gap-3">
                  {/* Filter Tabel Berdasarkan Tahun */}
                  <select className="border p-2 rounded-lg text-sm bg-slate-50 outline-none" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
                    <option value="">Semua Tahun</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>

                  <button onClick={handleDownloadGabungan} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow flex items-center gap-2">
                    <i className="fas fa-file-pdf"></i> Download Utuh (Gabungan)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3 border-b">Tahun</th>
                      <th className="p-3 border-b">Jenis Raport</th>
                      <th className="p-3 border-b">Tgl Upload</th>
                      <th className="p-3 border-b">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raportSiswa === undefined ? (
                      <tr><td colSpan="4" className="text-center p-6"><i className="fas fa-circle-notch fa-spin text-blue-500"></i> Memuat data...</td></tr>
                    ) : raportSiswa.length > 0 ? (
                      raportSiswa.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/50">
                          <td className="p-3 border-b text-slate-700 font-medium">{r.tahun || '-'}</td>
                          <td className="p-3 border-b text-slate-700">{r.jenis}</td>
                          <td className="p-3 border-b text-slate-500">{new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                          <td className="p-3 border-b">
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-blue-600 px-3 py-1 rounded border hover:bg-blue-600 hover:text-white transition">Lihat File</a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="text-center p-8 text-slate-400">Belum ada raport untuk siswa ini pada tahun yang dipilih.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-md text-center border border-dashed border-slate-300 flex flex-col items-center justify-center h-full">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <i className="fas fa-user-graduate text-3xl text-slate-300"></i>
               </div>
               <h3 className="text-lg font-semibold text-slate-600">Pilih Siswa Terlebih Dahulu</h3>
               <p className="text-sm text-slate-400 mt-2 max-w-sm">Gunakan kotak pencarian di sebelah kiri untuk memilih nama siswa dan melihat atau menambahkan arsip raport mereka.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

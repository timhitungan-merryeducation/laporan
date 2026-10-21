import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { poster, fetcher } from '../utils/api';
import { downloadMergedRaport } from '../utils/pdfProcessor';

export default function RaportManager() {
  const [file, setFile] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [searchName, setSearchName] = useState('');
  const [jenisRaport, setJenisRaport] = useState('Sisipan');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  const [filterTahun, setFilterTahun] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ambil daftar seluruh siswa
  const { data: listSiswa } = useSWR('getSiswaDashboardStats', fetcher);
  
  // Ambil data raport siswa jika nama sudah dikonfirmasi
  const { data: raportSiswa, mutate } = useSWR(
    namaSiswa ? ['getRaport', { namaSiswa, tahun: filterTahun }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  // Logic Autocomplete Siswa yang Diperbarui untuk format "Nama-Sekolah"
  const filteredStudents = useMemo(() => {
    if (!listSiswa || !searchName) return [];
    const searchLower = searchName.toLowerCase();
    
    // Pastikan listSiswa adalah array sebelum di-filter
    if (!Array.isArray(listSiswa)) return [];
    
    return listSiswa.filter(s => {
      // Kita hanya memfilter berdasarkan Nama Siswa (bukan sekolahnya)
      return s.nama && s.nama.toLowerCase().includes(searchLower);
    }).slice(0, 5); // Batasi 5 hasil agar dropdown tidak terlalu panjang
  }, [listSiswa, searchName]);

  const selectStudent = (name) => {
    setNamaSiswa(name);
    setSearchName(name); // Isi input text dengan nama lengkap
    setShowSuggestions(false); // Tutup dropdown
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
        kelas: "-", // Akan diisi "-" karena data kelas ada di kolom terpisah dari nama
        fileName: file.name,
        base64: event.target.result,
      };
      
      try {
        await poster('uploadRaport', payload);
        alert('Raport berhasil diunggah!');
        setFile(null); // Reset file input
        mutate(); // Refresh tabel arsip raport
      } catch (err) {
        alert('Gagal mengunggah raport. Periksa koneksi atau ukuran file.');
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadGabungan = async () => {
    if (!raportSiswa || raportSiswa.length === 0) return alert('Belum ada raport untuk siswa ini di tahun yang dipilih.');
    
    // Memberikan feedback visual saat proses menggabungkan PDF
    const btn = document.getElementById('btn-download');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    btn.disabled = true;

    try {
      const urls = raportSiswa.map(r => r.url);
      await downloadMergedRaport(urls, namaSiswa);
    } catch (e) {
      alert("Gagal menggabungkan PDF: Pastikan link Google Drive dapat diakses publik.");
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
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
                placeholder="Mulai ketik nama siswa..." 
                className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                value={searchName} 
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setNamaSiswa(''); // Reset state nama pasti jika user mengedit text
                  setShowSuggestions(true);
                }} 
                required 
              />
              
              {/* Dropdown Rekomendasi Siswa */}
              {showSuggestions && searchName && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, i) => (
                      <li key={i} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b transition-colors" onClick={() => selectStudent(s.nama)}>
                        <span className="font-bold text-slate-800">{s.nama}</span> <span className="text-xs text-slate-500">({s.sekolah}) - Wali: {s.guruWali}</span>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-sm text-slate-400 text-center">Data siswa tidak ditemukan</li>
                  )}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
              <select className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={tahunPelajaran} onChange={(e) => setTahunPelajaran(e.target.value)}>
                <option>2025/2026</option>
                <option>2026/2027</option>
                <option>2027/2028</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Jenis Raport</label>
              <select className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={jenisRaport} onChange={(e) => setJenisRaport(e.target.value)}>
                <option value="Sisipan">Raport Sisipan</option>
                <option value="Semester">Raport Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">File (PDF/Gambar)</label>
              <input type="file" accept=".pdf, image/*" className="w-full border p-2 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFile(e.target.files[0])} required />
            </div>

            <button type="submit" disabled={isUploading || !namaSiswa} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors mt-4 flex justify-center items-center gap-2">
               {isUploading ? 'Mengunggah...' : <><i className="fas fa-cloud-upload-alt"></i> Upload Raport</>}
            </button>
            {!namaSiswa && searchName && <p className="text-xs text-amber-500 text-center mt-2"><i className="fas fa-exclamation-triangle"></i> Silakan pilih nama siswa dari daftar rekomendasi dropdown.</p>}
          </form>
        </div>

        {/* Tabel Arsip Raport */}
        <div className="lg:col-span-2">
          {namaSiswa ? (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Arsip Raport</h3>
                  <p className="text-blue-600 font-bold text-xl">{namaSiswa}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  {/* Filter Tabel Berdasarkan Tahun */}
                  <div className="w-full md:w-auto">
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Filter Tahun</label>
                    <select className="border p-2 rounded-lg text-sm bg-slate-50 outline-none w-full" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
                      <option value="">Semua Tahun</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                    </select>
                  </div>

                  <div className="self-end w-full md:w-auto">
                    <button id="btn-download" onClick={handleDownloadGabungan} className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <i className="fas fa-file-pdf"></i> Download Utuh (Gabungan)
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3 border-b font-semibold rounded-tl-lg">Tahun Pelajaran</th>
                      <th className="p-3 border-b font-semibold">Jenis Raport</th>
                      <th className="p-3 border-b font-semibold">Tgl Upload</th>
                      <th className="p-3 border-b font-semibold rounded-tr-lg">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raportSiswa === undefined ? (
                      <tr><td colSpan="4" className="text-center p-8"><Loader /></td></tr>
                    ) : raportSiswa.length > 0 ? (
                      raportSiswa.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                          <td className="p-4 border-b text-slate-800 font-bold">{r.tahun || '-'}</td>
                          <td className="p-4 border-b text-slate-700">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${r.jenis === 'Semester' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.jenis}
                            </span>
                          </td>
                          <td className="p-4 border-b text-slate-500">{new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 border-b">
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors shadow-sm text-xs font-bold inline-flex items-center gap-1">
                              <i className="fas fa-eye"></i> Lihat PDF
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-12 text-slate-400 bg-slate-50/50 rounded-b-lg">
                          <i className="fas fa-folder-open text-3xl mb-3 opacity-50 block"></i>
                          Belum ada arsip raport untuk siswa ini pada tahun yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-md text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center h-full min-h-[400px]">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <i className="fas fa-user-graduate text-4xl text-slate-300"></i>
               </div>
               <h3 className="text-xl font-bold text-slate-700">Pilih Siswa Terlebih Dahulu</h3>
               <p className="text-slate-500 mt-2 max-w-md mx-auto">Gunakan kotak pencarian di sebelah kiri untuk mencari nama siswa. Daftar arsip raport akan muncul di sini setelah Anda memilih siswa.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

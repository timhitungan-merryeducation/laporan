import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { poster, fetcher } from '../utils/api';
import { downloadMergedRaport } from '../utils/pdfProcessor';
import Swal from 'sweetalert2'; // Notifikasi modern

// Fungsi kompresi gambar HTML5 Canvas
const compressImage = (file, maxSizeMB = 1.5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize jika terlalu besar (maks 1500px)
        const MAX_SIZE = 1500;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width; width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height; height = MAX_SIZE;
        }
        
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Kompres ke JPEG 70% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
  });
};

export default function RaportManager() {
  const [file, setFile] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [searchName, setSearchName] = useState('');
  const [jenisRaport, setJenisRaport] = useState('Sisipan');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  const [filterTahun, setFilterTahun] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: listSiswa } = useSWR('getSiswaDashboardStats', fetcher);
  
  // Mengambil raport 1 siswa
  const { data: raportSiswa, mutate } = useSWR(
    namaSiswa ? ['getRaport', { namaSiswa, tahun: filterTahun }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  // Mengambil semua raport global untuk tombol gabungan
  const { data: semuaRaport } = useSWR(['getRaport', { tahun: filterTahun }], ([action, params]) => fetcher(action, params));

  const filteredStudents = useMemo(() => {
    if (!listSiswa || !searchName || !Array.isArray(listSiswa)) return [];
    return listSiswa.filter(s => s.nama && s.nama.toLowerCase().includes(searchName.toLowerCase())).slice(0, 5);
  }, [listSiswa, searchName]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !namaSiswa) return Swal.fire('Peringatan', 'Nama Siswa dan File wajib diisi.', 'warning');
    
    // Cek ukuran PDF (maks 2.5MB agar aman di Vercel)
    if (file.type === 'application/pdf' && file.size > 2.5 * 1024 * 1024) {
      return Swal.fire('File Terlalu Besar', 'Ukuran PDF maksimal 2.5MB. Silakan kompres PDF Anda terlebih dahulu menggunakan alat online.', 'error');
    }

    setIsUploading(true);
    let base64Data = '';

    try {
      if (file.type.startsWith('image/')) {
        base64Data = await compressImage(file);
      } else {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      await poster('uploadRaport', { namaSiswa, jenisRaport, tahunPelajaran, kelas: "-", fileName: file.name, base64: base64Data });
      
      Swal.fire({ title: 'Berhasil!', text: 'Raport berhasil diunggah.', icon: 'success', timer: 2000, showConfirmButton: false });
      setFile(null);
      mutate(); 
    } catch (err) {
      Swal.fire('Error', 'Gagal mengunggah raport. ' + err.message, 'error');
    }
    setIsUploading(false);
  };

  const handleDownloadGabunganGlobal = async () => {
    if (!semuaRaport || semuaRaport.length === 0) return Swal.fire('Kosong', 'Belum ada raport yang diunggah pada tahun ini.', 'info');
    
    Swal.fire({ title: 'Memproses PDF', text: 'Menggabungkan raport semua siswa. Mohon tunggu...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const urls = semuaRaport.map(r => r.url);
      await downloadMergedRaport(urls, 'Seluruh_Siswa_Global');
      Swal.close();
    } catch (e) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menggabungkan PDF. Pastikan link Drive publik.', 'error');
    }
  };

  return (
    <Layout>
      <div className="mb-6 border-b pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Raport Siswa</h2>
          <p className="text-slate-500 mt-1">Unggah dan kompres file otomatis, serta gabungkan raport seluruh siswa.</p>
        </div>
        <button onClick={handleDownloadGabunganGlobal} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg shadow-md font-bold hover:bg-amber-600 transition-colors flex items-center gap-2">
          <i className="fas fa-file-archive"></i> Download Semua Raport (Global)
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Upload Raport Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Cari Nama Siswa</label>
              <input type="text" placeholder="Mulai ketik nama siswa..." className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={searchName} onChange={(e) => { setSearchName(e.target.value); setNamaSiswa(''); setShowSuggestions(true); }} required />
              {showSuggestions && searchName && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, i) => (
                      <li key={i} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b transition-colors" onClick={() => { setNamaSiswa(s.nama); setSearchName(s.nama); setShowSuggestions(false); }}>
                        <span className="font-bold text-slate-800">{s.nama}</span> <span className="text-xs text-slate-500">({s.sekolah})</span>
                      </li>
                    ))
                  ) : <li className="p-3 text-sm text-slate-400 text-center">Data tidak ditemukan</li>}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
              <select className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={tahunPelajaran} onChange={(e) => setTahunPelajaran(e.target.value)}><option>2025/2026</option><option>2026/2027</option><option>2027/2028</option></select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Jenis Raport</label>
              <select className="w-full border p-2.5 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={jenisRaport} onChange={(e) => setJenisRaport(e.target.value)}><option value="Sisipan">Raport Sisipan</option><option value="Semester">Raport Semester</option></select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">File (PDF/Gambar - Auto Compress)</label>
              <input type="file" accept=".pdf, image/*" className="w-full border p-2 rounded-lg bg-slate-50 text-sm" onChange={(e) => setFile(e.target.files[0])} required />
            </div>
            <button type="submit" disabled={isUploading || !namaSiswa} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors mt-4">
               {isUploading ? 'Mengunggah & Mengompresi...' : 'Upload Raport'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {namaSiswa ? (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <div className="flex justify-between items-end border-b pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Arsip Raport Individu</h3>
                  <p className="text-blue-600 font-bold text-xl">{namaSiswa}</p>
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Filter Tahun</label>
                  <select className="border p-2 rounded-lg text-sm w-full bg-slate-50 outline-none" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}><option value="">Semua Tahun</option><option value="2025/2026">2025/2026</option><option value="2026/2027">2026/2027</option></select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr><th className="p-3 border-b">Tahun</th><th className="p-3 border-b">Jenis</th><th className="p-3 border-b">Tgl Upload</th><th className="p-3 border-b">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {raportSiswa === undefined ? <tr><td colSpan="4" className="text-center p-8"><Loader /></td></tr> : raportSiswa.length > 0 ? raportSiswa.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/50">
                          <td className="p-4 border-b font-bold">{r.tahun}</td><td className="p-4 border-b">{r.jenis}</td><td className="p-4 border-b text-slate-500">{new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 border-b"><a href={r.url} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-blue-600 px-3 py-1.5 rounded-lg border hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold">Lihat</a></td>
                        </tr>
                      )) : <tr><td colSpan="4" className="text-center p-12 text-slate-400">Belum ada raport.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-md text-center border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
               <i className="fas fa-user-graduate text-4xl text-slate-300 mb-4 bg-slate-50 p-6 rounded-full"></i>
               <h3 className="font-bold text-slate-700">Pilih Siswa</h3>
               <p className="text-slate-500 text-sm mt-2">Cari nama siswa di panel kiri untuk melihat arsip pribadinya.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

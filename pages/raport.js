import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { poster, fetcher } from '../utils/api';
import { downloadMergedRaport } from '../utils/pdfProcessor';
import Swal from 'sweetalert2';

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > 1200) { h *= 1200 / w; w = 1200; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
  });
};

export default function RaportManager() {
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const [file, setFile] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [searchName, setSearchName] = useState('');
  
  const [jenisRaport, setJenisRaport] = useState('Sisipan Ganjil');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  
  const [filterTahunGlobal, setFilterTahunGlobal] = useState('2026/2027');
  const [filterJenisGlobal, setFilterJenisGlobal] = useState('Sisipan Ganjil');

  const { data: listSiswa, isLoading: isListSiswaLoading } = useSWR('getSiswaDashboardStats', fetcher);
  
  // Mengambil arsip individu
  const { data: raportSiswa, mutate } = useSWR(namaSiswa ? ['getRaport', { namaSiswa }] : null, ([action, params]) => fetcher(action, params));
  
  // Mengambil arsip global untuk digabungkan
  const { data: raportGlobal } = useSWR(['getRaportGlobal', { tahun: filterTahunGlobal, jenis: filterJenisGlobal }], ([action, params]) => fetcher(action, params));

  const filteredStudents = useMemo(() => {
    if (!listSiswa || !searchName || !Array.isArray(listSiswa)) return [];
    return listSiswa.filter(s => s.nama && s.nama.toLowerCase().includes(searchName.toLowerCase())).slice(0, 5);
  }, [listSiswa, searchName]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !namaSiswa) return Swal.fire('Oops!', 'Siswa & File wajib diisi.', 'warning');
    if (file.type === 'application/pdf' && file.size > 2.5 * 1024 * 1024) return Swal.fire('Gagal', 'PDF maks 2.5MB. Silakan kompres.', 'error');

    Swal.fire({ title: 'Memproses...', text: 'Mengunggah file ke Drive dan mencatat ke Sheet', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const base64Data = file.type.startsWith('image/') ? await compressImage(file) : await new Promise(r => { const f = new FileReader(); f.onload = e => r(e.target.result); f.readAsDataURL(file); });
      
      // Mengirim ke API. Pastikan API backend menulis payload ini ke Sheet "DataRaport"
      await poster('uploadRaport', { namaSiswa, jenisRaport, tahunPelajaran, kelas: "-", fileName: file.name, base64: base64Data });
      
      Swal.fire('Sukses!', `Raport ${namaSiswa} berhasil disimpan.`, 'success');
      setFile(null); 
      setSearchName('');
      setNamaSiswa('');
      mutate();
    } catch (err) { 
      Swal.fire('Error', 'Gagal upload. Periksa koneksi API backend Anda.', 'error'); 
    }
  };

  const handleDownloadGlobal = async () => {
    // Validasi ini memicu alert "Belum ada data raport" jika backend gagal mengembalikan data dari Sheet
    if (!raportGlobal || !Array.isArray(raportGlobal) || raportGlobal.length === 0) {
       return Swal.fire('Info', 'Belum ada data raport. Pastikan Sheet DataRaport sudah terisi.', 'info');
    }
    
    const targetPdfs = raportGlobal.filter(r => r.jenis === filterJenisGlobal && r.tahun === filterTahunGlobal).map(r => r.url);
    if (targetPdfs.length === 0) return Swal.fire('Info', `Tidak ada Raport ${filterJenisGlobal} untuk tahun ${filterTahunGlobal}`, 'info');

    Swal.fire({ title: 'Menyiapkan PDF', text: `Menggabungkan ${targetPdfs.length} file...`, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await downloadMergedRaport(targetPdfs, `Global_${filterJenisGlobal.replace(/ /g, '_')}_${filterTahunGlobal.replace(/\//g, '-')}`);
      Swal.close();
    } catch (e) { 
      Swal.fire('Error', 'Gagal mengunduh file.', 'error'); 
    }
  };

  if (isListSiswaLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader /> 
          <p className="mt-4 text-slate-500 font-medium">Memuat data dari sistem, mohon tunggu...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 border-b pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Raport & Dokumen</h2>
          <p className="text-slate-500 mt-1">Sistem arsip Drive otomatis berbasis Tahun dan Jenis Raport.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Upload Raport Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Cari Nama Siswa</label>
              <input 
                type="text" 
                placeholder="Ketik nama..." 
                className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" 
                value={searchName} 
                onChange={(e) => { 
                  setSearchName(e.target.value); 
                  setNamaSiswa(''); 
                  setShowSuggestions(true); 
                }} 
                required 
              />
              {showSuggestions && searchName && (
                <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                  {filteredStudents.map((s, i) => (
                    <li 
                      key={i} 
                      className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b" 
                      onClick={() => { 
                        setNamaSiswa(s.nama); 
                        setSearchName(s.nama); 
                        setShowSuggestions(false); 
                      }}
                    >
                      <span className="font-bold">{s.nama}</span>
                    </li>
                  ))}
                  {filteredStudents.length === 0 && <li className="p-3 text-sm text-slate-500">Siswa tidak ditemukan</li>}
                </ul>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
              <select className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" value={tahunPelajaran} onChange={e => setTahunPelajaran(e.target.value)}>
                <option>2025/2026</option>
                <option>2026/2027</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Jenis Raport</label>
              <select 
                className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" 
                value={jenisRaport} 
                onChange={e => setJenisRaport(e.target.value)}
              >
                <option value="Sisipan Ganjil">Sisipan Ganjil</option>
                <option value="Raport SAS (Semester Ganjil)">Raport SAS (Semester Ganjil)</option>
                <option value="Sisipan Genap">Sisipan Genap</option>
                <option value="Raport SAT (Semester Genap)">Raport SAT (Semester Genap)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Pilih File (Auto-Compress)</label>
              <input type="file" accept=".pdf, image/*" className="w-full border p-2 rounded-lg bg-slate-50 text-sm" onChange={e => setFile(e.target.files[0])} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 mt-4 flex justify-center gap-2">
               <i className="fas fa-upload"></i> Simpan
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-md text-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-amber-400">Unduh Gabungan (Global)</h3>
              <p className="text-sm text-slate-300">Gabungkan PDF seluruh siswa dalam 1 file berdasarkan filter.</p>
            </div>
            <div className="flex flex-wrap gap-2">
               <select className="border-none p-2 rounded bg-slate-700 text-sm outline-none" value={filterTahunGlobal} onChange={e => setFilterTahunGlobal(e.target.value)}>
                 <option>2025/2026</option><option>2026/2027</option>
               </select>
               <select className="border-none p-2 rounded bg-slate-700 text-sm outline-none" value={filterJenisGlobal} onChange={e => setFilterJenisGlobal(e.target.value)}>
                 <option>Sisipan Ganjil</option><option>Raport SAS (Semester Ganjil)</option><option>Sisipan Genap</option><option>Raport SAT (Semester Genap)</option>
               </select>
               <button onClick={handleDownloadGlobal} className="bg-amber-500 px-4 py-2 rounded font-bold hover:bg-amber-600 shadow text-slate-900 transition">
                 <i className="fas fa-file-pdf"></i> Unduh
               </button>
            </div>
          </div>

          {namaSiswa ? (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Arsip Pribadi: <span className="text-blue-600">{namaSiswa}</span></h3>
              {(!raportSiswa || raportSiswa.length === 0) ? (
                 <p className="text-slate-500 text-sm">Belum ada arsip untuk siswa ini.</p>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr><th className="p-3 border-b">Tahun</th><th className="p-3 border-b">Jenis</th><th className="p-3 border-b">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {raportSiswa.map((r, i) => (
                      <tr key={i} className="hover:bg-blue-50/50">
                        <td className="p-3 border-b font-bold">{r.tahun}</td><td className="p-3 border-b text-slate-700">{r.jenis}</td>
                        <td className="p-3 border-b"><a href={r.url} target="_blank" rel="noreferrer" className="bg-slate-100 text-blue-600 px-3 py-1 rounded border hover:bg-blue-600 hover:text-white font-bold text-xs">Lihat File</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-md text-center border-dashed border-2 border-slate-200">
              <i className="fas fa-search text-3xl text-slate-300 mb-3"></i>
              <p className="text-slate-500">Cari nama siswa di sebelah kiri untuk melihat arsip pribadinya.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

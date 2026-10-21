import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher, poster } from '../utils/api';

export default function LaporanMasalah() {
  const [guruSelected, setGuruSelected] = useState('');
  const [formData, setFormData] = useState({ tahun: '2026/2027', semester: 'Genap', masalah: '', solusi: '', komentar: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mengambil daftar guru untuk dropdown
  const { data: listGuru } = useSWR('getGuru', fetcher);
  
  // Mengambil riwayat laporan berdasarkan guru yang dipilih
  const { data: historyLaporan, mutate } = useSWR(guruSelected ? ['getLaporanByGuru', { guru: guruSelected }] : null, ([action, params]) => fetcher(action, params));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guruSelected || !formData.masalah) return alert('Pilih guru dan isi permasalahan!');
    
    setIsSubmitting(true);
    try {
      await poster('saveLaporan', { ...formData, guru: guruSelected });
      alert('Laporan berhasil disimpan!');
      setFormData({ ...formData, masalah: '', solusi: '', komentar: '' });
      mutate(); // Refresh tabel riwayat
    } catch (err) {
      alert('Gagal menyimpan laporan.');
    }
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Laporan Permasalahan & Solusi</h2>
          <p className="text-gray-500 mt-1">Catat dan pantau kendala akademik serta solusi pengajaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Buat Laporan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Tahun Ajaran</label>
                <select className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})}>
                  <option>2025/2026</option><option>2026/2027</option><option>2027/2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Semester</label>
                <select className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                  <option>Ganjil</option><option>Genap</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Guru</label>
              <select className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={guruSelected} onChange={e => setGuruSelected(e.target.value)} required>
                <option value="">-- Pilih Guru --</option>
                {listGuru?.map((g, i) => <option key={i} value={g.nama || g}>{g.nama || g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Permasalahan</label>
              <textarea className="w-full border p-3 rounded-lg bg-gray-50 h-24 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Deskripsikan masalah siswa/KBM..." value={formData.masalah} onChange={e => setFormData({...formData, masalah: e.target.value})} required></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Solusi yang Dilakukan</label>
              <textarea className="w-full border p-3 rounded-lg bg-gray-50 h-24 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Tindakan yang telah diambil..." value={formData.solusi} onChange={e => setFormData({...formData, solusi: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 flex justify-center items-center gap-2">
              <i className="fas fa-save"></i> {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-lg font-bold text-gray-700">Riwayat Laporan: <span className="text-blue-600">{guruSelected || 'Pilih Guru'}</span></h3>
            <button onClick={() => window.print()} className="text-sm bg-gray-800 hover:bg-gray-900 text-white py-1 px-3 rounded shadow"><i className="fas fa-print mr-1"></i> Cetak</button>
          </div>
          
          <div className="overflow-x-auto">
            {!guruSelected ? (
              <div className="text-center py-10 text-gray-400">
                <i className="fas fa-inbox text-5xl mb-3"></i>
                <p>Silakan pilih guru di panel kiri untuk melihat riwayat.</p>
              </div>
            ) : !historyLaporan ? (
              <Loader />
            ) : historyLaporan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada laporan tercatat untuk guru ini.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm">
                    <th className="p-3 rounded-tl-lg">Waktu & Info</th>
                    <th className="p-3">Permasalahan</th>
                    <th className="p-3 rounded-tr-lg">Solusi</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {historyLaporan.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50/50 transition-colors">
                      <td className="p-3 text-sm min-w-[120px]">
                        <div className="font-bold text-gray-800">{item.tahun} - {item.semester}</div>
                        <div className="text-gray-500 text-xs mt-1">{item.timestamp}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-pre-wrap">{item.masalah}</td>
                      <td className="p-3 text-sm text-gray-700 whitespace-pre-wrap">{item.solusi || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

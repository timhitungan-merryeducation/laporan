import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function ProgressSiswa() {
  const [guruSelected, setGuruSelected] = useState('');
  
  const { data: listGuru } = useSWR('getGuru', fetcher);
  
  // Menggunakan API yang sama dengan Input Nilai, tapi menarik semua mapel dengan mengosongkan parameter mapel
  const { data: siswaData } = useSWR(
    guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected, tahun: '2026/2027', semester: 'Ganjil', mapel: '' }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  return (
    <Layout>
      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold uppercase">LAPORAN PROGRESS SISWA</h2>
        <h3 className="text-lg">Guru Pembimbing: {guruSelected} | Tahun: 2026/2027</h3>
      </div>

      <div className="mb-6 border-b pb-4 print:hidden flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Progress Siswa</h2>
          <p className="text-slate-500 mt-1">Pantau perkembangan nilai siswa binaan dan cetak laporan.</p>
        </div>
        <button onClick={() => window.print()} disabled={!guruSelected} className="bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-md font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors flex items-center gap-2">
          <i className="fas fa-print"></i> Cetak PDF Progress
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 print:hidden">
        <label className="block text-sm font-bold text-slate-600 mb-2">Pilih Guru Pembimbing</label>
        <select className="w-full md:w-1/3 border p-2.5 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={guruSelected} onChange={(e) => setGuruSelected(e.target.value)}>
          <option value="">-- Pilih Guru --</option>
          {listGuru?.map((g, i) => <option key={i} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-none print:shadow-none print:p-0">
        {!guruSelected ? (
          <div className="text-center text-slate-400 py-12 print:hidden">Silakan pilih guru pembimbing untuk melihat progress siswa.</div>
        ) : !siswaData ? (
          <Loader />
        ) : siswaData.length === 0 ? (
          <div className="text-center text-slate-400 py-12">Tidak ada data siswa untuk guru ini.</div>
        ) : (
          <div className="space-y-6">
            {siswaData.map((s, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 print:border-b print:bg-white print:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-slate-800">{s.nama} <span className="text-sm font-normal text-slate-500 ml-2">Kelas: {s.kelas}</span></h4>
                </div>
                <table className="w-full text-center text-sm border-collapse bg-white">
                  <thead className="bg-blue-50 text-slate-700">
                    <tr><th className="p-2 border">U1</th><th className="p-2 border">U2</th><th className="p-2 border">U3</th><th className="p-2 border">U4</th><th className="p-2 border">STS</th><th className="p-2 border">SAS</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">{s.u1 || '-'}</td>
                      <td className="p-2 border font-medium">{s.u2 || '-'}</td>
                      <td className="p-2 border font-medium">{s.u3 || '-'}</td>
                      <td className="p-2 border font-medium">{s.u4 || '-'}</td>
                      <td className="p-2 border font-medium text-amber-600 bg-amber-50">{s.sts || '-'}</td>
                      <td className="p-2 border font-medium text-emerald-600 bg-emerald-50">{s.sas || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

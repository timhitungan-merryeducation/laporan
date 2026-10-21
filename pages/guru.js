import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DataGuru() {
  const { data, error } = useSWR('getGuruDashboardStats', fetcher);

  return (
    <Layout>
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Guru & Beban Ajar</h2>
        <p className="text-slate-500 mt-1">Informasi mata pelajaran dan daftar jumlah siswa binaan.</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 overflow-hidden">
        {!data && !error ? (
          <Loader />
        ) : error || !Array.isArray(data) ? (
          <div className="text-center text-red-500 py-8 font-semibold">
            <i className="fas fa-exclamation-triangle mr-2"></i> Gagal memuat data guru.
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-slate-400 py-8">Belum ada data guru yang terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-lg border-b whitespace-nowrap">Nama Guru</th>
                  <th className="p-4 font-semibold border-b whitespace-nowrap">Mata Pelajaran</th>
                  <th className="p-4 font-semibold border-b text-center whitespace-nowrap">Jumlah Siswa</th>
                  <th className="p-4 font-semibold rounded-tr-lg border-b">Siswa Binaan (Wali Murid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((guru, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors align-top">
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{guru.nama}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                        {guru.mapel}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-lg shadow-sm">
                        {guru.jumlahSiswa} Siswa
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 leading-relaxed text-xs max-w-lg">
                      {guru.waliMurid ? guru.waliMurid : <span className="text-slate-400 italic">Belum ada siswa binaan</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

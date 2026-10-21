import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DataSiswa() {
  // fetcher akan memanggil fungsi getSiswaDashboardStats yang sudah kita perbarui di Code.gs
  const { data, error } = useSWR('getSiswaDashboardStats', fetcher);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Siswa</h2>
          <p className="text-sm text-slate-500 mt-1">Daftar siswa dari seluruh guru pembimbing.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2">
          <i className="fas fa-plus"></i> Tambah Siswa
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {!data ? <Loader /> : data.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Tidak ada data siswa ditemukan.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 font-semibold">No</th>
                <th className="p-4 font-semibold">Nama Siswa</th>
                <th className="p-4 font-semibold">Asal Sekolah</th>
                <th className="p-4 font-semibold">Guru Pembimbing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((siswa, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-slate-500">{idx + 1}</td>
                  <td className="p-4 font-medium text-slate-800">{siswa.nama}</td>
                  <td className="p-4 text-slate-600">{siswa.sekolah}</td>
                  <td className="p-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs border border-slate-200">{siswa.guruWali}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

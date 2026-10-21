import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DashboardUtama() {
  const { data } = useSWR('getDashboard', fetcher, { refreshInterval: 60000 });

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ringkasan Statistik</h2>
        <p className="text-slate-500 text-sm mt-1">Pantau performa dan aktivitas E-Portal hari ini.</p>
      </div>

      {!data ? (
        <Loader />
      ) : (
        <>
          {/* Grid Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-full flex justify-center items-center text-2xl">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Guru</p>
                <h3 className="text-3xl font-bold text-slate-800">{data.countGuru || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-full flex justify-center items-center text-2xl">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Siswa Aktif</p>
                <h3 className="text-3xl font-bold text-slate-800">{data.countSiswa || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-amber-50 text-amber-600 w-14 h-14 rounded-full flex justify-center items-center text-2xl">
                <i className="fas fa-file-alt"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Modul & File Materi</p>
                <h3 className="text-3xl font-bold text-slate-800">{data.countFiles || 0}</h3>
              </div>
            </div>
          </div>

          {/* Tabel Jadwal */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800"><i className="fas fa-calendar-check text-blue-500 mr-2"></i> Jadwal Mendatang</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Hari/Jam</th>
                    <th className="py-3 px-6 font-semibold">Mata Pelajaran</th>
                    <th className="py-3 px-6 font-semibold">Kelas</th>
                    <th className="py-3 px-6 font-semibold">Jenis Agenda</th>
                    <th className="py-3 px-6 font-semibold">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.jadwal && data.jadwal.length > 0 ? (
                    data.jadwal.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 font-medium text-slate-800">{r[1]} / {r[2]}</td>
                        <td className="py-3 px-6">{r[3]}</td>
                        <td className="py-3 px-6">{r[4]}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${r[5] === 'Ulangan' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                            {r[5]}
                          </span>
                        </td>
                        <td className="py-3 px-6">{r[6] ? new Date(r[6]).toLocaleDateString('id-ID') : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-6 text-center text-slate-400">Tidak ada jadwal tercatat saat ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

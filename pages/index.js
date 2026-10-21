import useSWR from 'swr';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DashboardUtama() {
  // Menarik data dari URL Apps Script menggunakan SWR untuk kecepatan loading
  const { data, error } = useSWR('getDashboard', fetcher, { refreshInterval: 60000 });

  return (
    <Layout>
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard Statistik</h2>
        <p className="text-gray-500 mt-1">Ringkasan data E-Portal Math hari ini.</p>
      </div>

      {!data ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Guru" value={data.countGuru} color="bg-blue-600" icon="chalkboard-teacher" />
            <StatCard title="Total Siswa" value={data.countSiswa} color="bg-emerald-600" icon="user-graduate" />
            <StatCard title="File Materi" value={data.countFiles} color="bg-amber-500" icon="file-alt" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <i className="fas fa-calendar-check text-blue-600"></i> Jadwal Terbaru
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold rounded-tl-lg">Hari/Jam</th>
                    <th className="p-4 font-semibold">Mapel</th>
                    <th className="p-4 font-semibold">Kelas</th>
                    <th className="p-4 font-semibold">Jenis</th>
                    <th className="p-4 font-semibold">Tanggal</th>
                    <th className="p-4 font-semibold rounded-tr-lg">Siswa</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {data.jadwal && data.jadwal.length > 0 ? (
                    data.jadwal.map((r, idx) => (
                      <tr key={idx} className="border-b hover:bg-blue-50/40 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{r[1]} / {r[2]}</td>
                        <td className="p-4 text-gray-600">{r[3]}</td>
                        <td className="p-4 text-gray-600">{r[4]}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${r[5] === 'Ulangan' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {r[5]}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{r[6] ? new Date(r[6]).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="p-4 text-gray-600">{r[7] || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400">Belum ada jadwal terbaru.</td>
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

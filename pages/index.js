import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';

export default function Dashboard() {
  const { data } = useSWR('getDashboard', fetcher, { refreshInterval: 60000 });

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Dashboard Statistik</h2>
      {!data ? <div className="text-gray-500">Memuat...</div> : (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
            <h6 className="uppercase text-sm">Total Guru</h6>
            <h2 className="text-3xl font-bold">{data.countGuru}</h2>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-lg shadow">
            <h6 className="uppercase text-sm">Total Siswa</h6>
            <h2 className="text-3xl font-bold">{data.countSiswa}</h2>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
            <h6 className="uppercase text-sm">File Materi</h6>
            <h2 className="text-3xl font-bold">{data.countFiles}</h2>
          </div>
        </div>
      )}
    </Layout>
  );
}

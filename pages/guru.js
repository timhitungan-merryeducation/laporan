import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DataGuru() {
  const { data, error } = useSWR('getGuruDashboardStats', fetcher);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Data Guru & Beban Ajar</h2>
      <div className="bg-white rounded-lg shadow p-6">
        {!data ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">Nama Guru</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Siswa Binaan (Wali Murid)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((guru, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{guru.nama}</td>
                  <td className="p-3">{guru.mapel}</td>
                  <td className="p-3 text-sm">{guru.waliMurid || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

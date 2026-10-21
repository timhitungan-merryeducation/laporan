import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';

export default function DataSiswa() {
  const { data, error } = useSWR('getSiswaDashboardStats', fetcher);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Siswa</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          + Tambah Siswa
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {!data ? <Loader /> : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Sekolah</th>
                <th className="p-3">Guru Wali</th>
              </tr>
            </thead>
            <tbody>
              {data.map((siswa, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{siswa.nama}</td>
                  <td className="p-3">{siswa.kelas}</td>
                  <td className="p-3">{siswa.sekolah}</td>
                  <td className="p-3">{siswa.guruWali}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

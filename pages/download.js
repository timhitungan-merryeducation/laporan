import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';

export default function DownloadFile() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useSWR(['searchFiles', { query: search, page }], ([action, params]) => fetcher(action, params));

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Cari & Download File</h2>
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Cari nama file..." className="border p-2 rounded w-1/3" onChange={(e) => setSearch(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Cari</button>
      </div>

      <div className="bg-white rounded shadow p-6">
        <table className="w-full text-left border-collapse mb-4">
          <thead className="bg-gray-800 text-white">
            <tr><th className="p-3">Nama File</th><th className="p-3">Tipe</th><th className="p-3">Aksi</th></tr>
          </thead>
          <tbody>
            {data?.files?.map((f, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">{f[1]}</td>
                <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{f[2]}</span></td>
                <td className="p-3"><a href={f[6]} target="_blank" className="text-blue-600 hover:underline">Download</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <span className="py-1">Hal {page}</span>
          <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </Layout>
  );
}

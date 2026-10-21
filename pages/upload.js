import { useState } from 'react';
import Layout from '../components/Layout';

export default function UploadMateri() {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Upload Materi & Soal</h2>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis</label>
            <select className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Modul</option>
              <option>Latihan Soal</option>
              <option>Ujian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sekolah</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
            <input type="file" className="w-full border border-gray-300 p-1.5 rounded" required />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-colors">
              Upload Sekarang
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

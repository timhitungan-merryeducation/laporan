import Layout from '../components/Layout';

export default function InputJadwal() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Input Jadwal Pelajaran</h2>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
            <select className="w-full border border-gray-300 p-2 rounded"><option>2026/2027</option></select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hari</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>Senin</option><option>Selasa</option><option>Rabu</option><option>Kamis</option><option>Jumat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jam</label>
            <input type="time" className="w-full border border-gray-300 p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Pelajaran</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>Matematika</option><option>Fisika</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>Pelajaran</option><option>Ulangan</option>
            </select>
          </div>
          <div className="md:col-span-3 mt-4">
             <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow transition-colors">
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher, poster } from '../utils/api';

export default function InputNilai() {
  const [guruSelected, setGuruSelected] = useState('');
  // Misal daftar guru diambil dari API
  const { data: siswaData } = useSWR(guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected }] : null, ([action, params]) => fetcher(action, params));

  const handleAutoSave = async (nama, field, value) => {
    try {
      await poster('saveSingleGrade', { nama, field, value, guruPengajar: guruSelected });
      console.log(`Tersimpan: ${nama} - ${field} = ${value}`);
    } catch (e) {
      console.error("Gagal auto-save", e);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Nilai Siswa <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2">Auto-Save Aktif</span></h2>
      <div className="bg-white p-6 rounded shadow mb-6">
         <select className="border p-2 rounded w-full md:w-1/3" onChange={(e) => setGuruSelected(e.target.value)}>
           <option value="">-- Pilih Guru Pengajar --</option>
           <option value="Guru A">Guru A</option>
         </select>
      </div>
      
      {siswaData && (
        <div className="bg-white p-6 rounded shadow overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">U1</th>
                <th className="p-2 border">STS</th>
                <th className="p-2 border">SAS</th>
              </tr>
            </thead>
            <tbody>
              {siswaData.map((s, i) => (
                <tr key={i}>
                  <td className="p-2 border text-left">{s.nama}</td>
                  <td className="p-2 border"><input type="number" className="w-16 border rounded text-center" defaultValue={s.u1} onBlur={(e) => handleAutoSave(s.nama, 'u1', e.target.value)} /></td>
                  <td className="p-2 border"><input type="number" className="w-16 border rounded text-center" defaultValue={s.sts} onBlur={(e) => handleAutoSave(s.nama, 'sts', e.target.value)} /></td>
                  <td className="p-2 border"><input type="number" className="w-16 border rounded text-center" defaultValue={s.sas} onBlur={(e) => handleAutoSave(s.nama, 'sas', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

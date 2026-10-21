import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher, poster } from '../utils/api';
import Loader from '../components/Loader';

export default function InputNilai() {
  const [guruSelected, setGuruSelected] = useState('');
  const [tahun, setTahun] = useState('2026/2027');
  const [semester, setSemester] = useState('Ganjil');
  const [mapel, setMapel] = useState('Matematika');

  // Ambil nama guru langsung dari spreadsheet
  const { data: listGuru } = useSWR('getGuru', fetcher);
  
  // Ambil siswa sesuai guru & mapel yang dipilih
  const { data: siswaData, mutate } = useSWR(
    guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected, tahun, semester, mapel }] : null, 
    ([action, params]) => fetcher(action, params)
  );

  const handleAutoSave = async (nama, kelas, field, value) => {
    try {
      await poster('saveSingleGrade', { tahun, semester, nama, kelas, mapel, guruPengajar: guruSelected, field, value });
    } catch (e) { alert("Gagal auto-save, periksa koneksi."); }
  };

  return (
    <Layout>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Input Nilai Siswa <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2 shadow-sm">Auto-Save Aktif</span></h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Pilih Guru Pengajar</label>
          <select className="w-full border p-2 rounded-lg bg-slate-50 outline-none" value={guruSelected} onChange={(e) => setGuruSelected(e.target.value)}>
            <option value="">-- Pilih Guru --</option>
            {listGuru?.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Tahun Ajaran</label>
          <select className="w-full border p-2 rounded-lg bg-slate-50 outline-none" value={tahun} onChange={(e) => setTahun(e.target.value)}>
            <option>2025/2026</option><option>2026/2027</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Mata Pelajaran</label>
          <select className="w-full border p-2 rounded-lg bg-slate-50 outline-none" value={mapel} onChange={(e) => setMapel(e.target.value)}>
            <option>Matematika</option><option>Fisika</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        {!guruSelected ? (
           <div className="text-center text-slate-400 py-8">Silakan pilih guru pengajar terlebih dahulu.</div>
        ) : !siswaData ? (
           <Loader />
        ) : (
          <table className="w-full text-center border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 border-b text-left">Nama</th>
                <th className="p-3 border-b">U1</th>
                <th className="p-3 border-b">U2</th>
                <th className="p-3 border-b">U3</th>
                <th className="p-3 border-b">STS</th>
                <th className="p-3 border-b">SAS</th>
              </tr>
            </thead>
            <tbody>
              {siswaData.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 border-b text-left font-medium text-slate-700">{s.nama} <span className="text-xs text-slate-400">({s.kelas})</span></td>
                  <td className="p-3 border-b"><input type="number" className="w-14 border rounded p-1 text-center" defaultValue={s.u1} onBlur={(e) => handleAutoSave(s.nama, s.kelas, 'u1', e.target.value)} /></td>
                  <td className="p-3 border-b"><input type="number" className="w-14 border rounded p-1 text-center" defaultValue={s.u2} onBlur={(e) => handleAutoSave(s.nama, s.kelas, 'u2', e.target.value)} /></td>
                  <td className="p-3 border-b"><input type="number" className="w-14 border rounded p-1 text-center" defaultValue={s.u3} onBlur={(e) => handleAutoSave(s.nama, s.kelas, 'u3', e.target.value)} /></td>
                  <td className="p-3 border-b"><input type="number" className="w-14 border rounded p-1 text-center" defaultValue={s.sts} onBlur={(e) => handleAutoSave(s.nama, s.kelas, 'sts', e.target.value)} /></td>
                  <td className="p-3 border-b"><input type="number" className="w-14 border rounded p-1 text-center" defaultValue={s.sas} onBlur={(e) => handleAutoSave(s.nama, s.kelas, 'sas', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

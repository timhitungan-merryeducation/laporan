import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RekapNilai() {
  const [filterGuru, setFilterGuru] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  
  const { data: listGuru } = useSWR('getGuru', fetcher);
  const { data: rekap } = useSWR(['getRekapNilaiWithChart', { guru: filterGuru, mapel: filterMapel }], ([action, params]) => fetcher(action, params));

  return (
    <Layout>
      {/* AREA HEADER CETAK (KHUSUS MUNCUL SAAT DIPRINT) */}
      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold uppercase">REKAPITULASI NILAI SISWA</h2>
        <h3 className="text-lg">Guru: {filterGuru || 'Seluruh Guru'} | Mapel: {filterMapel || 'Semua Mata Pelajaran'}</h3>
      </div>

      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">Rekap & Grafik Nilai Siswa</h2>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-slate-900"><i className="fas fa-print mr-2"></i>Cetak Rekap</button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 print:hidden flex gap-4">
        <select className="border p-2 rounded-lg bg-slate-50 outline-none w-1/3" value={filterGuru} onChange={(e) => setFilterGuru(e.target.value)}>
          <option value="">Semua Guru</option>
          {listGuru?.map((g, i) => <option key={i} value={g}>{g}</option>)}
        </select>
        <select className="border p-2 rounded-lg bg-slate-50 outline-none w-1/3" value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)}>
          <option value="">Semua Mapel</option><option>Matematika</option><option>Fisika</option>
        </select>
      </div>

      {rekap && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 overflow-x-auto print:shadow-none print:border-none print:p-0">
            <table className="w-full text-center border-collapse text-sm border print:text-[10px]">
              <thead className="bg-slate-100">
                <tr>
                  <th rowSpan="2" className="p-2 border">Nama</th><th rowSpan="2" className="p-2 border">Kls</th><th rowSpan="2" className="p-2 border">Mapel</th><th rowSpan="2" className="p-2 border">Guru Pengajar</th>
                  <th colSpan="6" className="p-2 border">Ulangan Harian</th>
                  <th rowSpan="2" className="p-2 border">STS</th><th rowSpan="2" className="p-2 border">SAS</th><th rowSpan="2" className="p-2 border">Rapor</th><th rowSpan="2" className="p-2 border bg-blue-50">Rata-Rata</th>
                </tr>
                <tr>
                  <th className="border p-1">1</th><th className="border p-1">2</th><th className="border p-1">3</th><th className="border p-1">4</th><th className="border p-1">5</th><th className="border p-1">6</th>
                </tr>
              </thead>
              <tbody>
                {rekap.table.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border text-left font-bold">{row[0]}</td><td className="p-2 border">{row[1]}</td><td className="p-2 border">{row[2]}</td><td className="p-2 border">{row[3]}</td>
                    {[4,5,6,7,8,9,10,11,12].map(i => (
                      <td key={i} className={`p-2 border ${row[i] !== "" && row[i] <= 75 ? 'text-red-600 font-bold' : ''}`}>{row[i]}</td>
                    ))}
                    <td className="p-2 border bg-blue-50/50 font-bold">{row[13]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Teks Summary Keterangan */}
            <div className="mt-6 text-sm text-slate-700 leading-relaxed print:mt-4 print:text-[10px]">
               <strong>Keterangan:</strong><br/>
               Tahun Ajaran: Semua<br/>
               Guru Pengajar: {filterGuru || 'Semua Guru'}<br/>
               Mata Pelajaran: {filterMapel || 'Semua Mapel'}<br/>
               Jumlah Siswa: {rekap.statistik.total}<br/>
               Nilai ≤ 75 (≠ 0): {rekap.statistik.bawah75} siswa ({rekap.statistik.persen}%)
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] print:h-[300px] print:shadow-none print:border-none">
            <h5 className="font-bold text-center mb-4">Grafik Rata-Rata Nilai Siswa</h5>
            <Bar 
              data={{
                labels: rekap.chartLabels,
                datasets: [{ label: 'Rata-Rata Nilai', data: rekap.chartValues, backgroundColor: 'rgba(56, 189, 248, 0.8)' }]
              }} 
              options={{ responsive: true, maintainAspectRatio: false }} 
            />
          </div>
        </>
      )}
    </Layout>
  );
}

import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressSiswa() {
  const [guruSelected, setGuruSelected] = useState('');
  const { data: listGuru } = useSWR('getGuru', fetcher);
  const { data: siswaData } = useSWR(guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected, tahun: '2026/2027', semester: 'Ganjil', mapel: '' }] : null, ([action, params]) => fetcher(action, params));

  return (
    <Layout>
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold uppercase">LAPORAN EVALUASI & PROGRESS SISWA</h2>
        <p className="text-lg">Tahun Pelajaran 2026/2027 | Guru Pembimbing: {guruSelected}</p>
      </div>

      <div className="mb-6 border-b pb-4 print:hidden flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Progress Akademik Siswa</h2>
          <p className="text-slate-500 mt-1">Evaluasi nilai Ulangan dan Ujian Semester.</p>
        </div>
        <button onClick={() => window.print()} disabled={!guruSelected} className="bg-slate-800 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-900 disabled:opacity-50"><i className="fas fa-print"></i> Cetak Laporan Progress</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 print:hidden">
        <label className="block text-sm font-bold text-slate-600 mb-2">Pilih Guru Pembimbing</label>
        <select className="w-1/3 border p-2.5 rounded-lg bg-slate-50 outline-none" value={guruSelected} onChange={(e) => setGuruSelected(e.target.value)}>
          <option value="">-- Pilih Guru --</option>
          {listGuru?.map((g, i) => <option key={i} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="space-y-8">
        {siswaData?.map((s, idx) => {
          // Logika Analisa Progress Otomatis
          const nilaiUH = [s.u1, s.u2, s.u3, s.u4].filter(n => n !== '').map(Number);
          const rataUH = nilaiUH.length ? (nilaiUH.reduce((a,b)=>a+b,0)/nilaiUH.length).toFixed(1) : 0;
          const target = Number(s.sts) || Number(s.sas) || 0;
          
          let kesimpulan = "Data nilai belum lengkap untuk dianalisa.";
          if (rataUH > 0 && target > 0) {
            if (target > rataUH) kesimpulan = `Ananda ${s.nama} menunjukkan progress positif. Terdapat peningkatan signifikan dari rata-rata harian (${rataUH}) saat menghadapi ujian besar (${target}). Strategi belajar saat ini sangat efektif.`;
            else if (target == rataUH) kesimpulan = `Performa Ananda ${s.nama} sangat stabil. Nilai ujian sejalan dengan kemampuan yang ditunjukkan pada sesi ulangan harian.`;
            else kesimpulan = `Terjadi penurunan fokus pada ujian besar. Nilai ujian (${target}) berada di bawah rata-rata potensi hariannya (${rataUH}). Perlu evaluasi manajemen waktu ujian dan pengulangan materi.`;
          }

          const chartData = {
            labels: ['U1', 'U2', 'U3', 'U4', 'STS', 'SAS'],
            datasets: [{ label: 'Nilai', data: [s.u1||0, s.u2||0, s.u3||0, s.u4||0, s.sts||0, s.sas||0], backgroundColor: ['#93c5fd', '#93c5fd', '#93c5fd', '#93c5fd', '#fcd34d', '#6ee7b7'] }]
          };

          return (
            <div key={idx} className="bg-white border-2 border-slate-100 rounded-xl p-6 print:border-b-4 print:border-slate-800 print:mb-12 print:break-inside-avoid">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800"><i className="fas fa-user-graduate text-blue-500 mr-2"></i>{s.nama}</h3>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-semibold border">Kelas: {s.kelas}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-48">
                   <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } }} />
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-2 border-b pb-1"><i className="fas fa-clipboard-check text-green-600 mr-2"></i>Kesimpulan & Evaluasi:</h4>
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">{kesimpulan}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

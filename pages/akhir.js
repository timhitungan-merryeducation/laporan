import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LaporanAkhir() {
  const { data: stats } = useSWR('getTeacherComparisonStats', fetcher);

  const chartData = {
    labels: stats?.labels || [],
    datasets: [{
      data: stats?.values || [],
      backgroundColor: ['#f9a8d4', '#7dd3fc', '#fde047', '#c4b5fd'], // Warna pink, biru, kuning seperti PDF lama
    }]
  };

  return (
    <Layout>
      {/* HEADER CETAK */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold uppercase">LAPORAN AKHIR HASIL BELAJAR</h2>
        <p className="text-lg">Komparasi Rata-Rata Performa Siswa Per Guru Pengajar</p>
      </div>

      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-3xl font-extrabold text-slate-800">Dashboard Laporan Akhir</h2>
        <button onClick={() => window.print()} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg shadow-md"><i className="fas fa-print mr-2"></i>Cetak Laporan</button>
      </div>

      {stats && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none">
          <h3 className="text-xl font-bold text-center text-slate-800 mb-8 print:hidden">Komparasi Rata-Rata Nilai Siswa per Guru Pengajar</h3>
          <div className="relative h-[400px] w-full print:h-[500px]">
            <Bar 
              data={chartData} 
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
              }} 
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LaporanAkhir() {
  const { data: stats } = useSWR('getTeacherComparisonStats', fetcher);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#e5e7eb' } },
      x: { grid: { display: false } }
    }
  };

  const chartData = {
    labels: stats?.labels || [],
    datasets: [{
      label: 'Rata-Rata Kelas',
      data: stats?.values || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', // blue-500
        'rgba(16, 185, 129, 0.8)', // emerald-500
        'rgba(245, 158, 11, 0.8)', // amber-500
        'rgba(139, 92, 246, 0.8)', // violet-500
        'rgba(239, 68, 68, 0.8)'   // red-500
      ],
      borderRadius: 6, // Rounded bars for modern look
    }]
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Dashboard Laporan Akhir</h2>
          <p className="text-gray-500 mt-1">Komparasi rata-rata performa siswa per guru pengajar.</p>
        </div>
        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2">
          <i className="fas fa-print"></i> Cetak Laporan
        </button>
      </div>

      {!stats ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Grafik Komparasi Rata-Rata Nilai</h3>
            </div>
            
            {/* Area Grafik */}
            <div className="relative h-96 w-full">
              {stats.labels.length > 0 ? (
                <Bar options={chartOptions} data={chartData} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Belum ada data nilai yang mencukupi untuk dirender.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

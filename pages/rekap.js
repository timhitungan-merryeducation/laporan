import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RekapNilai() {
  const [filterGuru, setFilterGuru] = useState('');
  const { data: rekapData } = useSWR(filterGuru ? ['getRekapNilaiWithChart', { guru: filterGuru }] : null, ([action, params]) => fetcher(action, params));

  const chartOptions = { responsive: true, maintainAspectRatio: false };
  const chartData = {
    labels: rekapData?.chartLabels || [],
    datasets: [{
      label: 'Rata-Rata Nilai',
      data: rekapData?.chartValues || [],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
    }]
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rekap & Grafik Nilai Siswa</h2>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded">Cetak Rekap</button>
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <select className="border p-2 rounded" onChange={(e) => setFilterGuru(e.target.value)}>
          <option value="">Pilih Guru Pengajar</option>
          <option value="Guru A">Guru A</option>
        </select>
      </div>

      {rekapData && (
        <>
          <div className="bg-white p-6 rounded shadow mb-6 overflow-x-auto">
            <table className="w-full text-center border-collapse text-sm">
              <thead className="bg-gray-200">
                <tr><th>Nama</th><th>Kelas</th><th>Rata-Rata</th></tr>
              </thead>
              <tbody>
                {rekapData.table.map((row, idx) => (
                  <tr key={idx} className="border-b"><td className="p-2 text-left">{row[0]}</td><td>{row[1]}</td><td>{row[13]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white p-6 rounded shadow h-96">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </>
      )}
    </Layout>
  );
}

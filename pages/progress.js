import { useState, useMemo } from 'react'; // Menambahkan useMemo agar tidak eror
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressSiswa({ dataSiswa, dataNilai }) {
  const [filterTahun, setFilterTahun] = useState('2026/2027');
  const [filterSemester, setFilterSemester] = useState('Ganjil');
  const [filterMapel, setFilterMapel] = useState('Matematika');

  const nilaiDifilter = useMemo(() => {
    if (!dataNilai) return [];
    return dataNilai.filter(item => 
      item.tahun === filterTahun && 
      item.semester === filterSemester && 
      item.mapel === filterMapel
    );
  }, [dataNilai, filterTahun, filterSemester, filterMapel]);

  const renderGrafik = (dataArray) => {
    if (!dataArray || dataArray.length === 0) {
      return <div className="text-slate-500">Belum ada data pada filter ini.</div>;
    }

    // Mengambil data pertama yang cocok dengan filter
    const data = dataArray[0];
    const hasAnyGrade = data.U1 || data.U2 || data.U3 || data.U4 || data.STS || data.SAS;

    if (!hasAnyGrade) {
       return <div className="text-slate-500">Belum ada nilai yang diinput sama sekali.</div>;
    }

    // Menerapkan data ke grafik Chart.js
    const chartData = {
      labels: ['U1', 'U2', 'U3', 'U4', 'STS', 'SAS'],
      datasets: [
        {
          label: `Nilai ${filterMapel}`,
          data: [
            data.U1 || 0, 
            data.U2 || 0, 
            data.U3 || 0, 
            data.U4 || 0, 
            data.STS || 0, 
            data.SAS || 0
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 4,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    };

    return (
      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <Bar data={chartData} options={chartOptions} /> 
      </div>
    );
  };

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6">Progress Akademik Siswa</h2>
        
        {/* AREA FILTER BARU */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-md border-t-4 border-blue-600">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase">Tahun</label>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="border p-2 rounded bg-slate-50">
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase">Semester</label>
            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="border p-2 rounded bg-slate-50">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase">Mata Pelajaran</label>
            <select value={filterMapel} onChange={e => setFilterMapel(e.target.value)} className="border p-2 rounded bg-slate-50">
              <option value="Matematika">Matematika</option>
              <option value="Sains">Sains</option>
              <option value="Fisika">Fisika</option>
            </select>
          </div>
        </div>

        {/* AREA RENDER GRAFIK */}
        <div className="grid">
          {renderGrafik(nilaiDifilter)}
        </div>
      </div>
    </Layout>
  );
}

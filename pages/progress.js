import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Pastikan props dataNilai dan dataSiswa dikirim dari komponen pemanggil atau getServerSideProps
export default function ProgressSiswa({ dataSiswa, dataNilai }) {
  // 1. State Filter Lengkap (Termasuk Guru)
  const [filterGuru, setFilterGuru] = useState('Pak Wanto');
  const [filterTahun, setFilterTahun] = useState('2026/2027');
  const [filterSemester, setFilterSemester] = useState('Ganjil');
  const [filterMapel, setFilterMapel] = useState('Matematika');

  // 2. Logika Filter Data
  const nilaiDifilter = useMemo(() => {
    // Pastikan dataNilai adalah array sebelum difilter
    if (!dataNilai || !Array.isArray(dataNilai)) return [];
    
    return dataNilai.filter(item => 
      item.tahun === filterTahun && 
      item.semester === filterSemester && 
      item.mapel === filterMapel &&
      (item.guru === filterGuru || item.namaGuru === filterGuru) // Mendukung variasi nama properti
    );
  }, [dataNilai, filterTahun, filterSemester, filterMapel, filterGuru]);

  // 3. Fungsi Render Grafik
  const renderGrafik = (dataArray) => {
    if (!dataArray || dataArray.length === 0) {
      return <div className="text-slate-500 font-medium">Belum ada data pada filter ini. Pastikan data di Sheet sesuai dengan filter yang dipilih.</div>;
    }

    const data = dataArray[0];
    const hasAnyGrade = data.U1 || data.U2 || data.U3 || data.U4 || data.STS || data.SAS;

    if (!hasAnyGrade) {
       return <div className="text-slate-500 font-medium">Siswa ditemukan, tetapi belum ada nilai yang diinput sama sekali.</div>;
    }

    const chartData = {
      labels: ['U1', 'U2', 'U3', 'U4', 'STS', 'SAS'],
      datasets: [
        {
          label: `Nilai ${filterMapel} - ${filterGuru}`,
          data: [
            data.U1 || 0, 
            data.U2 || 0, 
            data.U3 || 0, 
            data.U4 || 0, 
            data.STS || 0, 
            data.SAS || 0
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
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
      <div className="bg-white p-4 rounded-xl shadow mt-4 max-w-4xl">
        <Bar data={chartData} options={chartOptions} /> 
      </div>
    );
  };

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6">Progress Akademik Siswa</h2>
        
        {/* PANEL FILTER */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Guru</label>
            <select value={filterGuru} onChange={e => setFilterGuru(e.target.value)} className="border p-2 rounded-lg bg-slate-50 min-w-[150px] outline-none">
              <option value="Pak Wanto">Pak Wanto</option>
              <option value="Bu Siti">Bu Siti</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tahun</label>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none">
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Semester</label>
            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
            <select value={filterMapel} onChange={e => setFilterMapel(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none">
              <option value="Matematika">Matematika</option>
              <option value="Sains">Sains</option>
              <option value="Fisika">Fisika</option>
            </select>
          </div>
        </div>

        {/* AREA GRAFIK */}
        <div className="grid">
          {renderGrafik(nilaiDifilter)}
        </div>
      </div>
    </Layout>
  );
}

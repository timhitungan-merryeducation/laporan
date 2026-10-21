import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressSiswa() {
  const [filterGuru, setFilterGuru] = useState('Semua Guru');
  const [filterTahun, setFilterTahun] = useState('2026/2027');
  const [filterSemester, setFilterSemester] = useState('Ganjil');
  const [filterMapel, setFilterMapel] = useState('Matematika');

  // Ambil Data Guru untuk Dropdown
  const { data: daftarGuru, isLoading: loadGuru } = useSWR('getGuru', fetcher);

  // Ambil Data Nilai (Rekap Data Chart) dari Backend Apps Script
  const paramsQuery = {
    tahun: filterTahun,
    semester: filterSemester,
    mapel: filterMapel,
    guru: filterGuru === 'Semua Guru' ? '' : filterGuru
  };
  
  // Memanggil 'getRekapNilaiWithChart' ke code.gs
  const { data: dataRekap, isLoading: loadRekap } = useSWR(['getRekapNilaiWithChart', paramsQuery], ([action, p]) => fetcher(action, p));

  const renderGrafik = () => {
    if (loadRekap) {
       return <div className="text-center py-10"><Loader /><p>Memuat grafik nilai...</p></div>;
    }

    if (!dataRekap || !dataRekap.chartLabels || dataRekap.chartLabels.length === 0) {
      return (
        <div className="bg-white p-10 rounded-xl shadow text-center border-dashed border-2 border-slate-200 mt-4">
          <p className="text-slate-500 font-medium">Belum ada data nilai yang diinput pada filter ini.</p>
          <p className="text-sm text-slate-400 mt-2">Pastikan guru tersebut sudah mengisi nilai {filterMapel} semester {filterSemester}.</p>
        </div>
      );
    }

    const chartData = {
      labels: dataRekap.chartLabels, // Nama-nama siswa
      datasets: [
        {
          label: `Rata-rata Nilai ${filterMapel}`,
          data: dataRekap.chartValues, // Nilai rata-rata dari code.gs
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
      <div className="bg-white p-4 rounded-xl shadow mt-4 max-w-full overflow-x-auto">
        <div style={{ minWidth: dataRekap.chartLabels.length > 5 ? '800px' : 'auto' }}>
           <Bar data={chartData} options={chartOptions} /> 
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6">Progress Akademik Siswa</h2>
        
        {/* PANEL FILTER BARU */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Guru Pengajar</label>
            <select value={filterGuru} onChange={e => setFilterGuru(e.target.value)} className="border p-2 rounded-lg bg-slate-50 min-w-[150px] outline-none">
              <option value="Semua Guru">Semua Guru</option>
              {daftarGuru && daftarGuru.map((g, i) => <option key={i} value={g}>{g}</option>)}
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
          {renderGrafik()}
        </div>
      </div>
    </Layout>
  );
}

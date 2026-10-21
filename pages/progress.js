import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressSiswa({ dataSiswa, dataNilai }) {
  // 1. Tambahkan State untuk Filter Baru
  const [filterTahun, setFilterTahun] = useState('2026/2027');
  const [filterSemester, setFilterSemester] = useState('Ganjil');
  const [filterMapel, setFilterMapel] = useState('Matematika');

  // 2. Logika Filter Data (Mengambil nilai yang cocok dengan filter)
  const nilaiDifilter = useMemo(() => {
    if (!dataNilai) return [];
    return dataNilai.filter(item => 
      item.tahun === filterTahun && 
      item.semester === filterSemester && 
      item.mapel === filterMapel
    );
  }, [dataNilai, filterTahun, filterSemester, filterMapel]);

  // 3. Logika Menampilkan Data Parsial (Tidak perlu menunggu lengkap)
  const renderGrafik = (nilaiSiswa) => {
    // Mengecek apakah setidaknya ADA satu nilai yang sudah diisi
    const hasAnyGrade = nilaiSiswa.U1 || nilaiSiswa.U2 || nilaiSiswa.U3 || nilaiSiswa.U4 || nilaiSiswa.STS || nilaiSiswa.SAS;

    if (!hasAnyGrade) {
       return <div className="text-slate-500">Belum ada nilai yang diinput sama sekali.</div>;
    }

    // Return komponen Chart Anda di sini. 
    // Jika U3 atau U4 kosong, Chart (seperti Recharts/Chart.js) otomatis akan melewatinya (menjadi 0 atau terputus)
    return (
      <YourChartComponent data={nilaiSiswa} /> 
    );
  };

  return (
    <div>
      {/* AREA FILTER BARU */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="border p-2 rounded">
          <option value="2025/2026">2025/2026</option>
          <option value="2026/2027">2026/2027</option>
        </select>
        
        <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="border p-2 rounded">
          <option value="Ganjil">Ganjil</option>
          <option value="Genap">Genap</option>
        </select>
        
        <select value={filterMapel} onChange={e => setFilterMapel(e.target.value)} className="border p-2 rounded">
          <option value="Matematika">Matematika</option>
          <option value="Sains">Sains</option>
          <option value="Fisika">Fisika</option>
        </select>
      </div>

      {/* AREA RENDER GRAFIK */}
      <div className="grid">
        {/* Render grafik menggunakan fungsi yang sudah mengizinkan nilai parsial */}
        {renderGrafik(nilaiDifilter)}
      </div>
    </div>
  );
}

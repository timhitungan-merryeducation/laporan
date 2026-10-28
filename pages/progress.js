import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { fetcher } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressSiswa() {
  const [guruSelected, setGuruSelected] = useState('');
  const [tahun, setTahun] = useState('2026/2027');
  const [mapel, setMapel] = useState('Matematika');
  
  const { data: listGuru } = useSWR('getGuru', fetcher);
  
  const { data: siswaGanjil } = useSWR(guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected, tahun, semester: 'Ganjil', mapel }] : null, ([action, params]) => fetcher(action, params));
  const { data: siswaGenap } = useSWR(guruSelected ? ['getStudentsWithExistingGrades', { guru: guruSelected, tahun, semester: 'Genap', mapel }] : null, ([action, params]) => fetcher(action, params));

  return (
    <Layout>
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold uppercase">LAPORAN EVALUASI & PROGRESS SISWA</h2>
        <h3 className="text-lg">Tahun Pelajaran {tahun} | Guru Pembimbing: {guruSelected} | Mapel: {mapel}</h3>
      </div>

      <div className="mb-6 border-b pb-4 print:hidden flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Progress Akademik Siswa</h2>
          <p className="text-slate-500 mt-1">Evaluasi perbandingan nilai Ulangan Sisipan dan Ujian (Ganjil vs Genap).</p>
        </div>
        <button onClick={() => window.print()} disabled={!guruSelected} className="bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-md font-bold hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2">
          <i className="fas fa-print"></i> Cetak Laporan
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 print:hidden flex flex-wrap gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-slate-600 mb-2">Pilih Guru Pembimbing</label>
          <select className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" value={guruSelected} onChange={(e) => setGuruSelected(e.target.value)}>
            <option value="">-- Pilih Guru --</option>
            {listGuru?.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="w-1/2 md:w-1/4">
          <label className="block text-sm font-bold text-slate-600 mb-2">Tahun Pelajaran</label>
          <select className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" value={tahun} onChange={(e) => setTahun(e.target.value)}><option>2025/2026</option><option>2026/2027</option></select>
        </div>
        <div className="w-1/2 md:w-1/4">
          <label className="block text-sm font-bold text-slate-600 mb-2">Mata Pelajaran</label>
          <select className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none" value={mapel} onChange={(e) => setMapel(e.target.value)}><option>Matematika</option><option>Fisika</option></select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-none print:shadow-none print:p-0">
        {!guruSelected ? (
          <div className="text-center text-slate-400 py-12 print:hidden">Pilih guru pembimbing untuk memuat data.</div>
        ) : !siswaGanjil ? (
          <Loader />
        ) : siswaGanjil.length === 0 ? (
          <div className="text-center text-slate-400 py-12">Tidak ada data nilai siswa untuk mapel dan guru ini.</div>
        ) : (
          <div className="space-y-12">
            {siswaGanjil.map((sGanjil, idx) => {
              const sGenap = siswaGenap?.find(s => s.nama === sGanjil.nama) || { u1:'', u2:'', u3:'', u4:'', sts:'', sas:'' };
              
              const calcRata = (arr) => { const valid = arr.filter(n => n !== '').map(Number); return valid.length ? +(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1) : 0; };
              
              const rataSisipanGanjil = calcRata([sGanjil.u1, sGanjil.u2, sGanjil.u3, sGanjil.u4]);
              const sasGanjil = Number(sGanjil.sas) || Number(sGanjil.sts) || 0; 
              
              const rataSisipanGenap = calcRata([sGenap.u1, sGenap.u2, sGenap.u3, sGenap.u4]);
              const sasGenap = Number(sGenap.sas) || Number(sGenap.sts) || 0; 

              let kesimpulan = "Data nilai belum lengkap untuk diberikan evaluasi akhir.";
              if (sasGanjil > 0 && sasGenap > 0) {
                 if (sasGenap > sasGanjil) kesimpulan = `Ananda ${sGanjil.nama} menunjukkan progress belajar yang sangat positif. Terdapat peningkatan dari hasil Ujian Semester Ganjil (${sasGanjil}) menjadi (${sasGenap}) di Semester Genap. Strategi belajar saat ini sangat efektif.`;
                 else if (sasGenap == sasGanjil) kesimpulan = `Performa akademik Ananda ${sGanjil.nama} konsisten sepanjang tahun pelajaran. Nilai akhir di kedua semester bertahan pada angka ${sasGenap}.`;
                 else kesimpulan = `Terjadi penurunan performa pada Ananda ${sGanjil.nama}. Hasil evaluasi Semester Genap (${sasGenap}) lebih rendah dibandingkan Semester Ganjil (${sasGanjil}). Perlu evaluasi tambahan dan pengulangan materi krusial.`;
              } else if (sasGanjil > 0) {
                 kesimpulan = `Evaluasi sementara: Ananda ${sGanjil.nama} menyelesaikan Semester Ganjil dengan nilai akhir ${sasGanjil} (Rata-rata Sisipan: ${rataSisipanGanjil}). Menunggu hasil Semester Genap untuk komparasi utuh.`;
              }

              const chartData = {
                labels: ['Sisipan Ganjil', 'Ujian Akhir Ganjil (SAS)', 'Sisipan Genap', 'Ujian Akhir Genap (SAT)'],
                datasets: [{ label: 'Nilai Akademik', data: [rataSisipanGanjil, sasGanjil, rataSisipanGenap, sasGenap], backgroundColor: ['#93c5fd', '#3b82f6', '#fcd34d', '#f59e0b'], borderRadius: 4 }]
              };

              return (
                <div key={idx} className="border-2 border-slate-100 rounded-xl p-6 bg-white print:border-b-4 print:border-slate-800 print:mb-16 print:break-inside-avoid print:shadow-none">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-extrabold text-slate-800"><i className="fas fa-user-graduate text-blue-500 mr-3"></i>{sGanjil.nama}</h3>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-semibold border text-sm">Kelas: {sGanjil.kelas}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-56"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100, min: 0 } } }} /></div>
                    <div className="flex flex-col justify-center bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><i className="fas fa-clipboard-check text-emerald-600"></i>Catatan Evaluasi Progress:</h4>
                      <p className="text-sm text-slate-600 leading-relaxed text-justify italic">{kesimpulan}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

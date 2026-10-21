import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  
  const menus = [
    { name: 'Dashboard Utama', path: '/', icon: 'home' },
    { name: 'Data Guru', path: '/guru', icon: 'user-tie' },
    { name: 'Data Siswa', path: '/siswa', icon: 'user-graduate' },
    { name: 'Upload File', path: '/upload', icon: 'cloud-upload-alt' },
    { name: 'Input Nilai', path: '/nilai', icon: 'file-invoice' },
    { name: 'Input Jadwal', path: '/jadwal', icon: 'calendar-alt' },
    { name: 'Cari & Download', path: '/download', icon: 'search' },
    { name: 'Rekap Nilai', path: '/rekap', icon: 'chart-bar' },
    { name: 'Laporan Masalah', path: '/laporan', icon: 'clipboard-list' },
    { name: 'Laporan Akhir', path: '/akhir', icon: 'trophy' },
    { name: 'Manajemen Raport', path: '/raport', icon: 'file-pdf' }
  ];

  return (
    <div className="w-64 bg-[#2c3e50] min-h-screen text-white fixed top-0 left-0 overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-600 mb-4 flex items-center justify-center gap-3">
        <i className="fas fa-graduation-cap text-2xl"></i>
        <h4 className="font-bold text-lg">E-Portal Math</h4>
      </div>
      <ul className="space-y-1 px-3 pb-6">
        {menus.map((menu) => {
          const isActive = router.pathname === menu.path;
          return (
            <li key={menu.path}>
              <Link href={menu.path} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-white/15 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}>
                <i className={`fas fa-${menu.icon} w-6 text-center`}></i>
                {menu.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

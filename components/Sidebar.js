import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  
  const menus = [
    { name: 'Dashboard', path: '/', icon: 'chart-pie' },
    { name: 'Data Guru', path: '/guru', icon: 'chalkboard-teacher' },
    { name: 'Data Siswa', path: '/siswa', icon: 'user-graduate' },
    { name: 'Manajemen Raport', path: '/raport', icon: 'file-pdf' },
    { name: 'Upload Materi', path: '/upload', icon: 'cloud-upload-alt' },
    { name: 'Input Nilai', path: '/nilai', icon: 'edit' },
    { name: 'Progress Siswa', path: '/progress', icon: 'tasks' }, // MENU BARU
    { name: 'Jadwal Kelas', path: '/jadwal', icon: 'calendar-alt' },
    { name: 'Cari File', path: '/download', icon: 'folder-open' },
    { name: 'Rekapitulasi', path: '/rekap', icon: 'chart-bar' },
    { name: 'Laporan Kendala', path: '/laporan', icon: 'clipboard-list' },
    { name: 'Laporan Akhir', path: '/akhir', icon: 'award' },
  ];

  return (
    <div className="w-64 bg-sidebar min-h-screen text-slate-300 fixed top-0 left-0 overflow-y-auto shadow-xl z-50 transition-all duration-300 border-r border-slate-700">
      <div className="p-6 flex items-center gap-3 bg-slate-900 border-b border-slate-700/50">
        <div className="bg-primary text-white p-2 rounded-lg">
          <i className="fas fa-graduation-cap text-xl"></i>
        </div>
        <div>
          <h4 className="font-bold text-white tracking-wide">E-Portal</h4>
          <p className="text-xs text-slate-400">Math & Science</p>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu Utama</p>
        <ul className="space-y-1.5">
          {menus.map((menu) => {
            const isActive = router.pathname === menu.path;
            return (
              <li key={menu.path}>
                <Link 
                  href={menu.path} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-white font-medium shadow-md shadow-blue-900/20' 
                      : 'hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <i className={`fas fa-${menu.icon} w-5 text-center ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                  <span className="text-sm">{menu.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

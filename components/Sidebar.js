import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  const menus = [
    { name: 'Dashboard Utama', path: '/' },
    { name: 'Data Guru', path: '/guru' },
    { name: 'Data Siswa', path: '/siswa' },
    { name: 'Manajemen Raport', path: '/raport' }, // Menu Baru
  ];

  return (
    <div className="w-64 bg-sidebar min-h-screen text-white p-4 fixed">
      <h4 className="text-center py-3 border-b border-gray-600 font-bold mb-4">E-Portal Math</h4>
      <ul className="space-y-2">
        {menus.map((menu) => (
          <li key={menu.path}>
            <Link href={menu.path} className={`block p-2 rounded transition-colors ${router.pathname === menu.path ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}>
              {menu.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

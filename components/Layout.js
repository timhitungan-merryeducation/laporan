import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {/* Header Area Minimalis */}
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Panel Administrasi</h2>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="bg-slate-100 px-3 py-1 rounded-full"><i className="fas fa-circle text-green-500 text-[10px] mr-2"></i>Sistem Online</span>
            </div>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}

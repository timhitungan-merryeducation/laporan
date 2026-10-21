import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      <Sidebar />
      <main className="ml-64 p-8 w-full animate-fade-in flex-1">
        {children}
      </main>
    </div>
  );
}

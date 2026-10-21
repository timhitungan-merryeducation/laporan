import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full animate-fade-in">
        {children}
      </main>
    </div>
  );
}

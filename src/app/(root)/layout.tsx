import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

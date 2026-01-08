import { Outlet } from 'react-router-dom';
import { SidebarNav } from './sidebar-nav';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

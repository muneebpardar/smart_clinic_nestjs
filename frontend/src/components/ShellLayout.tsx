import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ShellLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarItems: SidebarItem[];
}

export const ShellLayout = ({ children, activeTab, setActiveTab, sidebarItems }: ShellLayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-light text-slate-800">
            Smart<span className="font-semibold text-emerald-600">Clinic</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Icon className="w-5 h-5" /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              {user?.role?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-800 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 md:hidden justify-between">
          <h1 className="text-xl font-light text-slate-800">
            Smart<span className="font-semibold text-emerald-600">Clinic</span>
          </h1>
          <span className="text-sm font-semibold text-slate-500 capitalize">{activeTab}</span>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

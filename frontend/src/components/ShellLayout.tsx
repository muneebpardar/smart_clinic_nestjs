import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, Calendar, Users, FileText } from 'lucide-react';

export const ShellLayout = ({ children }: { children: React.ReactNode }) => {
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
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-emerald-700 bg-emerald-50 rounded-xl font-medium transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium transition-colors">
            <Calendar className="w-5 h-5" /> Appointments
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" /> Patients
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium transition-colors">
            <FileText className="w-5 h-5" /> Records
          </a>
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
            className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 md:hidden">
          <h1 className="text-xl font-light text-slate-800">
            Smart<span className="font-semibold text-emerald-600">Clinic</span>
          </h1>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

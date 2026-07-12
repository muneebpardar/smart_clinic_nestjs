import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100/50 rounded-2xl">
        <h1 className="text-3xl font-light text-slate-800 mb-6 text-center">
          Smart<span className="font-semibold text-emerald-600">Clinic</span>
        </h1>
        <p className="text-slate-500 text-center mb-8">Premium Healthcare Portal</p>
        
        <Link 
          to="/dashboard"
          className="block w-full py-3 px-4 bg-teal-500 text-white text-center rounded-xl font-medium 
          hover:scale-[1.01] active:scale-[0.99] hover:bg-teal-600 transition-all duration-200 shadow-sm"
        >
          Access Portal
        </Link>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-sm border border-slate-100/50 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-slate-800 font-semibold">Welcome, {user?.role || 'Guest'}</h2>
          <button 
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
            <h3 className="text-lg text-emerald-600 font-medium mb-2">Appointments</h3>
            <p className="text-slate-500 text-sm">Manage your upcoming schedules.</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
            <h3 className="text-lg text-emerald-600 font-medium mb-2">Medical Records</h3>
            <p className="text-slate-500 text-sm">View your clinical history safely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

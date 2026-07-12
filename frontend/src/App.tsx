import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DashboardManager } from './components/DashboardManager';

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
          className="block w-full py-3 px-4 bg-teal-500 text-white text-center rounded-xl font-medium hover:scale-[1.01] active:scale-[0.99] hover:bg-teal-600 transition-all duration-200 shadow-sm"
        >
          Access Portal
        </Link>
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
            <Route path="/dashboard" element={<DashboardManager />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

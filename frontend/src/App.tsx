import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardManager } from './components/DashboardManager';
import { useAuth } from './context/AuthContext';
import { api } from './api/axios';

const Login = () => {
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isRegister) {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const specialty = formData.get('specialty') as string;
        const licenseNumber = formData.get('licenseNumber') as string;
        const dateOfBirth = formData.get('dateOfBirth') as string;

        const { data } = await api.post('/auth/register', {
          email,
          password,
          role,
          firstName,
          lastName,
          specialty: role === 'doctor' ? specialty : undefined,
          licenseNumber: role === 'doctor' ? licenseNumber : undefined,
          dateOfBirth: role === 'patient' && dateOfBirth ? dateOfBirth : undefined,
        });
        setAuth(data.user, data.access_token);
      } else {
        const { data } = await api.post('/auth/login', { email, password });
        setAuth(data.user, data.access_token);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {isRegister ? 'Create your account' : 'Sign in to SmartClinic'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
          >
            {isRegister ? 'sign in to your existing account' : 'register as a new patient or doctor'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isRegister && (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Register as:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none ${
                        role === 'patient'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('doctor')}
                      className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none ${
                        role === 'doctor'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Doctor
                    </button>
                  </div>
                </div>

                {role === 'patient' && (
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                )}

                {role === 'doctor' && (
                  <>
                    <div>
                      <label htmlFor="specialty" className="block text-sm font-medium text-slate-700">
                        Specialty
                      </label>
                      <select
                        id="specialty"
                        name="specialty"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white"
                      >
                        <option value="General Practice">General Practice</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Orthopedics">Orthopedics</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700">
                        Medical License Number
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        required
                        placeholder="LIC-123456"
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={isRegister ? '' : 'patient1@demo.com'}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  defaultValue={isRegister ? '' : 'password123'}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isRegister ? 'Register & Sign In' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <DashboardManager /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

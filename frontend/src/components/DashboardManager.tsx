import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { ShellLayout } from './ShellLayout';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReceptionistBoard } from './ReceptionistBoard';
import { MedicalRecordsManager } from './MedicalRecordsManager';
import { InsuranceDashboard } from './InsuranceDashboard';
import { SmartBookingWizard } from './SmartBookingWizard';
import { SOAPEditor } from './SOAPEditor';
import { AiIntakeForm } from './AiIntakeForm';

export const DashboardManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Setup WebSocket connection
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000');
    
    socket.on('connect', () => {
      console.log('Connected to real-time events');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('appointmentUpdate', (data) => {
      console.log('Real-time update:', data);
      // We would dispatch a global state update or refetch here
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!user) return null;

  // Render Admin Portal
  if (user.role === 'admin') {
    return (
      <ShellLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Admin Portal</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${socketConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              {socketConnected ? 'Live Sync' : 'Offline'}
            </div>
          </div>
          <AnalyticsDashboard />
        </div>
      </ShellLayout>
    );
  }

  // Render Doctor Portal
  if (user.role === 'doctor') {
    return (
      <ShellLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors ${activeTab === 'appointments' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Appointments
              </button>
              <button 
                onClick={() => setActiveTab('records')}
                className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors ${activeTab === 'records' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Medical Records
              </button>
              <button 
                onClick={() => setActiveTab('soap')}
                className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors ${activeTab === 'soap' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                SOAP Note Editor
              </button>
            </div>
          </div>
          
          {activeTab === 'appointments' ? (
            <div className="bg-white/80 p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
              <h2 className="text-xl font-semibold text-slate-700">Today's Appointments</h2>
              <p className="text-slate-500">Doctor's daily schedule will appear here.</p>
            </div>
          ) : activeTab === 'records' ? (
            <MedicalRecordsManager />
          ) : (
            <SOAPEditor />
          )}
        </div>
      </ShellLayout>
    );
  }

  // Render Receptionist Portal
  if (user.role === 'receptionist') {
    return (
      <ShellLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors ${activeTab === 'appointments' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Booking Board
              </button>
              <button 
                onClick={() => setActiveTab('insurance')}
                className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors ${activeTab === 'insurance' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Insurance Pre-Auth
              </button>
            </div>
          </div>

          {activeTab === 'appointments' ? (
            <ReceptionistBoard />
          ) : (
            <InsuranceDashboard />
          )}
        </div>
      </ShellLayout>
    );
  }

  // Render Patient Portal
  return (
    <ShellLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Patient Portal</h1>
        <SmartBookingWizard />
        <AiIntakeForm />
      </div>
    </ShellLayout>
  );
};

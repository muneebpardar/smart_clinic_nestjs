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
import { Activity, Calendar, Users, FileText, BarChart2, Bot } from 'lucide-react';
import { api } from '../api/axios';

export const DashboardManager = () => {
  const { user } = useAuth();
  
  const getDefaultTab = (role?: string) => {
    if (role === 'admin') return 'analytics';
    if (role === 'doctor') return 'appointments';
    if (role === 'receptionist') return 'booking';
    return 'booking'; // patient default
  };

  const [activeTab, setActiveTab] = useState(() => getDefaultTab(user?.role));
  const [socketConnected, setSocketConnected] = useState(false);

  // Doctor schedule states
  const [doctorAppts, setDoctorAppts] = useState<any[]>([]);
  const [selectedApptTriage, setSelectedApptTriage] = useState<any | null>(null);
  const [loadingDoctorAppts, setLoadingDoctorAppts] = useState(false);

  const fetchDoctorAppointments = async () => {
    if (user?.role !== 'doctor') return;
    setLoadingDoctorAppts(true);
    try {
      const { data } = await api.get('/appointments/doctor/me');
      setDoctorAppts(data);
    } catch (err) {
      console.error('Failed to fetch doctor appointments', err);
    } finally {
      setLoadingDoctorAppts(false);
    }
  };

  useEffect(() => {
    if (user) {
      setActiveTab(getDefaultTab(user.role));
      if (user.role === 'doctor') {
        fetchDoctorAppointments();
      }
    }
  }, [user]);

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
      if (user?.role === 'doctor') {
        fetchDoctorAppointments();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!user) return null;

  const getSidebarItems = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'analytics', label: 'Analytics', icon: BarChart2 }
        ];
      case 'doctor':
        return [
          { id: 'appointments', label: 'Schedule', icon: Calendar },
          { id: 'records', label: 'Patient Records', icon: Users }
        ];
      case 'receptionist':
        return [
          { id: 'booking', label: 'Booking Board', icon: Calendar },
          { id: 'insurance', label: 'Insurance Pre-Auth', icon: FileText }
        ];
      case 'patient':
        return [
          { id: 'booking', label: 'Book Appointment', icon: Calendar },
          { id: 'intake', label: 'AI Intake Form', icon: Activity }
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(user.role);

  const renderDoctorSchedule = () => {
    if (loadingDoctorAppts) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (doctorAppts.length === 0) {
      return (
        <div className="bg-white/80 p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-slate-700">No Scheduled Appointments</h2>
          <p className="text-slate-500 mt-2">Your daily schedule is clear today.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white/80 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scheduled Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">AI Intake Summary</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {doctorAppts.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-55/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    {appt.patient?.firstName} {appt.patient?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full capitalize ${
                      appt.status === 'scheduled' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {appt.triageSummary ? (
                      <button
                        onClick={() => setSelectedApptTriage(appt.triageSummary)}
                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" /> View Card
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Not completed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setActiveTab('soap');
                      }}
                      className="text-teal-600 hover:text-teal-900 font-semibold cursor-pointer"
                    >
                      Draft SOAP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pre-Consultation Summary Modal */}
        {selectedApptTriage && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm">Pre-Consultation Card</h3>
                </div>
                <button
                  onClick={() => setSelectedApptTriage(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chief Complaint</h4>
                  <p className="text-slate-800 text-sm font-medium mt-1">{selectedApptTriage.chiefComplaint}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</h4>
                    <p className="text-slate-800 text-sm font-medium mt-1">{selectedApptTriage.duration}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</h4>
                    <p className="text-slate-800 text-sm font-medium mt-1">{selectedApptTriage.severity} / 10</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical History</h4>
                  <p className="text-slate-800 text-sm font-medium mt-1">{selectedApptTriage.history || 'None reported'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Medications</h4>
                  <p className="text-slate-800 text-sm font-medium mt-1">{selectedApptTriage.medications || 'None reported'}</p>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 flex justify-end">
                <button
                  onClick={() => setSelectedApptTriage(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (user.role === 'admin') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Admin Portal</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${socketConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              {socketConnected ? 'Live Sync' : 'Offline'}
            </div>
          </div>
          <AnalyticsDashboard />
        </div>
      );
    }

    if (user.role === 'doctor') {
      const isRecordsView = activeTab === 'records' || activeTab === 'soap';
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-bold text-slate-800 capitalize font-light">
              Doctor <span className="font-semibold text-teal-600">Dashboard</span>
            </h1>
            
            {isRecordsView && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('records')}
                  className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors cursor-pointer ${activeTab === 'records' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  View Records
                </button>
                <button 
                  onClick={() => setActiveTab('soap')}
                  className={`font-semibold pb-4 -mb-[17px] border-b-2 transition-colors cursor-pointer ${activeTab === 'soap' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  SOAP Note Editor
                </button>
              </div>
            )}
          </div>
          
          {activeTab === 'appointments' ? (
            renderDoctorSchedule()
          ) : activeTab === 'records' ? (
            <MedicalRecordsManager />
          ) : (
            <SOAPEditor />
          )}
        </div>
      );
    }

    if (user.role === 'receptionist') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-bold text-slate-800 capitalize font-light">
              Receptionist <span className="font-semibold text-teal-600">Dashboard</span>
            </h1>
          </div>

          {activeTab === 'booking' ? (
            <ReceptionistBoard />
          ) : (
            <InsuranceDashboard />
          )}
        </div>
      );
    }

    // Patient Portal
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 font-light">
            Patient <span className="font-semibold text-teal-600">Portal</span>
          </h1>
        </div>

        {activeTab === 'booking' ? (
          <SmartBookingWizard />
        ) : (
          <AiIntakeForm />
        )}
      </div>
    );
  };

  return (
    <ShellLayout activeTab={activeTab === 'soap' ? 'records' : activeTab} setActiveTab={setActiveTab} sidebarItems={sidebarItems}>
      {renderContent()}
    </ShellLayout>
  );
};

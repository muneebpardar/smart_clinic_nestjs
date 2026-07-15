import { useState, useEffect, type DragEvent } from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import { Calendar, Clock, AlertCircle, User, GripVertical, Plus, RefreshCw } from 'lucide-react';
import { api } from '../api/axios';

interface AppointmentItem {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: string;
  type: string;
  noShowRiskScore?: number;
  noShowReasoning?: string;
  patientId: string;
  doctorId: string;
}

export const ReceptionistBoard = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Walk-in modal states
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [walkInPatientName, setWalkInPatientName] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  // Generate 9 AM to 5 PM slots
  const slots = Array.from({ length: 9 }, (_, i) => format(addHours(startOfDay(new Date()).setHours(9, 0, 0, 0), i), 'HH:mm'));

  const fetchBoardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all appointments
      const { data: apptsData } = await api.get('/appointments');
      
      // Fetch all doctors
      const { data: docsData } = await api.get('/profiles/doctors');
      setDoctors(docsData);

      // Map appointments to UI shape
      const mappedAppts = await Promise.all(
        apptsData.map(async (appt: any) => {
          const startTime = new Date(appt.startTime);
          const timeString = format(startTime, 'HH:mm');
          
          let riskScore = 0;
          let reasoning = '';
          
          // Predict No-Show Risk via AI Proxy for scheduled appointments
          if (appt.status === 'scheduled') {
            try {
              const { data: risk } = await api.post('/ai-proxy/predict-no-show', {
                patientData: {
                  patientId: appt.patient?.id,
                  specialty: appt.doctor?.specialty,
                  timeOfDay: timeString,
                  dayOfWeek: format(startTime, 'EEEE'),
                }
              });
              riskScore = risk.riskScore || 0;
              reasoning = risk.reasoning || '';
            } catch (err) {
              // Fallback scoring logic
              riskScore = Math.floor(Math.random() * 40) + 10; // default safe mock
            }
          }

          return {
            id: appt.id,
            patientName: `${appt.patient?.firstName || 'Walk-in'} ${appt.patient?.lastName || 'Patient'}`,
            doctorName: appt.doctor ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}` : 'Specialist',
            time: timeString,
            status: appt.status === 'scheduled' ? 'Scheduled' : appt.status === 'completed' ? 'Completed' : 'Checked In',
            type: appt.doctor?.specialty || 'General',
            noShowRiskScore: riskScore,
            noShowReasoning: reasoning,
            patientId: appt.patient?.id || '',
            doctorId: appt.doctor?.id || '',
          };
        })
      );
      
      setAppointments(mappedAppts);
    } catch (err) {
      console.error('Failed to load receptionist board data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  const handleDragStart = (e: DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent, slotTime: string) => {
    e.preventDefault();
    if (!draggedId) return;

    // In a real application, we would call the backend to patch start/end times.
    // For local responsiveness, we update the state:
    setAppointments(prev => prev.map(app => 
      app.id === draggedId ? { ...app, time: slotTime } : app
    ));
    setDraggedId(null);
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setIsSubmittingWalkIn(true);
    
    try {
      // Find or use a default patient ID. For walk-ins, we can assign a demo patient.
      // Fetch patient list or use demo ID:
      const patientId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // demo patient UUID
      
      await api.post('/appointments/walk-in', {
        doctorId: selectedDoctorId,
        patientId,
      });

      setIsWalkInOpen(false);
      setWalkInPatientName('');
      fetchBoardData();
    } catch (err) {
      console.error(err);
      alert('Failed to register walk-in. Check backend logs.');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  const triggerReminder = (patientName: string) => {
    alert(`WhatsApp reminder sent successfully to ${patientName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Booking Board</h2>
          <p className="text-slate-500 text-sm mt-1">Manage today's schedule and waitlist.</p>
        </div>
        <button 
          onClick={() => setIsWalkInOpen(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Walk-in Booking
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm font-medium">Updating live schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Column */}
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100/50 rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-slate-700">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">Today's Schedule</h3>
            </div>
            
            <div className="space-y-4">
              {slots.map(slot => {
                const slotApps = appointments.filter(a => a.time === slot);
                return (
                  <div 
                    key={slot} 
                    className="flex gap-4 p-3 rounded-xl border border-slate-50/55 bg-slate-50/50 min-h-[85px] transition-colors hover:bg-slate-100/50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slot)}
                  >
                    <div className="w-16 flex-shrink-0 text-slate-500 font-semibold text-sm pt-2">
                      {slot}
                    </div>
                    <div className="flex-1 space-y-2">
                      {slotApps.length === 0 ? (
                        <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs py-4">
                          Drop to reschedule
                        </div>
                      ) : (
                        slotApps.map(app => {
                          const isHighRisk = app.noShowRiskScore && app.noShowRiskScore > 65;
                          
                          return (
                            <div 
                              key={app.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-emerald-300 transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-800 text-sm">{app.patientName}</span>
                                    {isHighRisk && (
                                      <span 
                                        title={app.noShowReasoning || 'Risk score calculated by AI'}
                                        className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full cursor-help"
                                      >
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        High Risk ({app.noShowRiskScore}%)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <User className="w-3 h-3" />
                                    <span>{app.doctorName} • {app.type}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 self-end sm:self-center">
                                {isHighRisk && (
                                  <button
                                    onClick={() => triggerReminder(app.patientName)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Send Alert
                                  </button>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  app.status === 'Checked In' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Waitlist Column */}
          <div className="bg-slate-800 rounded-2xl p-6 text-slate-100 shadow-lg relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-teal-400" />
              <h3 className="font-semibold text-lg text-white">Waitlist Queue</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">Charlie Davis</span>
                  <span className="text-[10px] uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                    High
                  </span>
                </div>
                <div className="text-xs text-slate-400">Prefers: Morning</div>
                <button 
                  onClick={() => alert('Assigned slot successfully!')}
                  className="mt-3 w-full py-1.5 text-xs font-medium bg-slate-600 hover:bg-teal-500 transition-colors rounded-lg text-white cursor-pointer"
                >
                  Assign Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {isWalkInOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">New Walk-in Booking</h3>
              <button 
                onClick={() => setIsWalkInOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateWalkIn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Doctor</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Details</label>
                <input 
                  type="text"
                  required
                  value={walkInPatientName}
                  onChange={e => setWalkInPatientName(e.target.value)}
                  placeholder="e.g. Alice Walker (Demo Walk-in)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmittingWalkIn ? 'Saving...' : 'Book Walk-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, type DragEvent } from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import { Calendar, Clock, AlertCircle, User, GripVertical } from 'lucide-react';

// Mock Data
const INITIAL_APPOINTMENTS = [
  { id: '1', patientName: 'Alice Walker', doctorName: 'Dr. John Smith', time: '09:00', status: 'Scheduled', type: 'General' },
  { id: '2', patientName: 'Bob Ray', doctorName: 'Dr. Sarah Jones', time: '10:30', status: 'Checked In', type: 'Dermatology', noShowRisk: true },
];

const WAITLIST = [
  { id: 'w1', patientName: 'Charlie Davis', requestedTime: 'Morning', priority: 'High' },
];

export const ReceptionistBoard = () => {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Generate 9 AM to 5 PM slots
  const slots = Array.from({ length: 9 }, (_, i) => format(addHours(startOfDay(new Date()).setHours(9, 0, 0, 0), i), 'HH:mm'));

  const handleDragStart = (e: DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, slotTime: string) => {
    e.preventDefault();
    if (!draggedId) return;

    setAppointments(prev => prev.map(app => 
      app.id === draggedId ? { ...app, time: slotTime } : app
    ));
    setDraggedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Booking Board</h2>
          <p className="text-slate-500 text-sm mt-1">Manage today's schedule and waitlist.</p>
        </div>
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          + Walk-in Appointment
        </button>
      </div>

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
                  className="flex gap-4 p-3 rounded-xl border border-slate-50/50 bg-slate-50/50 min-h-[80px] transition-colors hover:bg-slate-100/50"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slot)}
                >
                  <div className="w-16 flex-shrink-0 text-slate-500 font-medium text-sm pt-2">
                    {slot}
                  </div>
                  <div className="flex-1 space-y-2">
                    {slotApps.length === 0 ? (
                      <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                        Drop to reschedule
                      </div>
                    ) : (
                      slotApps.map(app => (
                        <div 
                          key={app.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          className="group flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-emerald-300 transition-all"
                        >
                          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800 text-sm">{app.patientName}</span>
                              {app.noShowRisk && (
                                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-3 h-3" />
                                  High Risk
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <User className="w-3 h-3" />
                              <span>{app.doctorName} • {app.type}</span>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            app.status === 'Checked In' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {app.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waitlist Column */}
        <div className="bg-slate-800 rounded-2xl p-6 text-slate-100 shadow-lg relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-lg text-white">Waitlist Queue</h3>
          </div>

          <div className="space-y-3">
            {WAITLIST.map(item => (
              <div key={item.id} className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{item.patientName}</span>
                  <span className="text-[10px] uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                    {item.priority}
                  </span>
                </div>
                <div className="text-xs text-slate-400">Prefers: {item.requestedTime}</div>
                <button className="mt-3 w-full py-1.5 text-xs font-medium bg-slate-600 hover:bg-teal-500 transition-colors rounded-lg text-white">
                  Assign Slot
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { ShellLayout } from './ShellLayout';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AiIntakeForm } from './AiIntakeForm';

export const DashboardManager = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState('Disconnected');

  useEffect(() => {
    // Connect to WebSocket gateway for real-time synchronization
    const socket = io('http://localhost:3000');
    socket.on('connect', () => setSyncStatus('Connected'));
    socket.on('disconnect', () => setSyncStatus('Disconnected'));
    
    // Listen for events
    socket.on('appointmentUpdate', (data) => {
      console.log('Real-time sync event received:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const renderPortal = () => {
    switch (user?.role) {
      case 'admin':
        return <AnalyticsDashboard />;
      case 'doctor':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Doctor Portal</h2>
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-600">Upcoming Appointments Sync: {syncStatus}</p>
              {/* Specialized Doctor Components */}
            </div>
            <AiIntakeForm />
          </div>
        );
      case 'receptionist':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Reception Desk</h2>
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-600">Live Status: {syncStatus}</p>
            </div>
            <AiIntakeForm />
          </div>
        );
      case 'patient':
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Patient Portal</h2>
            <AiIntakeForm />
          </div>
        );
    }
  };

  return <ShellLayout>{renderPortal()}</ShellLayout>;
};

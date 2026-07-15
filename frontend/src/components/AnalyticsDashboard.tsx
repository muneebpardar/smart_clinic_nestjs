import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const AnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/appointments/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch real-time analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">Computing clinic analytics...</p>
      </div>
    );
  }

  const occupancyData = data?.occupancyData || [];
  const noShowData = data?.noShowData || [];
  const insuranceData = data?.insuranceData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 font-light">
          Admin <span className="font-semibold text-teal-600">Analytics Overview</span>
        </h2>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-700 mb-6">Today's Occupancy (Booked Patients per Slot)</h3>
          <div className="h-[300px]">
            {occupancyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No data logged today</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="patients" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* No-Show Trends */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-700 mb-6">30-Day Cancellation & No-Show Trends (%)</h3>
          <div className="h-[300px]">
            {noShowData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No trends recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={noShowData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Insurance Ratios */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm lg:col-span-2 flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-700 mb-2">Insurance Pre-Auth Ratios</h3>
            <p className="text-slate-500 text-sm max-w-sm">Breakdown of insurance authorizations based on live patient check-ins and appointments.</p>
          </div>
          <div className="h-[250px] w-full md:w-1/2">
            {insuranceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No insurance requests processed</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={insuranceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {insuranceData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const noShowData = [
  { name: 'Week 1', rate: 12 },
  { name: 'Week 2', rate: 8 },
  { name: 'Week 3', rate: 15 },
  { name: 'Week 4', rate: 5 },
];

const occupancyData = [
  { time: '09:00', patients: 12 },
  { time: '11:00', patients: 18 },
  { time: '13:00', patients: 8 },
  { time: '15:00', patients: 22 },
  { time: '17:00', patients: 14 },
];

const insuranceData = [
  { name: 'Approved', value: 75 },
  { name: 'Pending', value: 15 },
  { name: 'Denied', value: 10 },
];
const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">Admin Analytics Overview</h2>
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium">Real-time Sync Active</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-700 mb-6">Today's Occupancy</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="patients" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* No-Show Trends */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-700 mb-6">30-Day No-Show Trends (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={noShowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insurance Ratios */}
        <div className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm lg:col-span-2 flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-700 mb-2">Insurance Pre-Auth Ratios</h3>
            <p className="text-slate-500 text-sm max-w-sm">Breakdown of insurance authorizations for upcoming clinical sessions. High pending rates may delay completions.</p>
          </div>
          <div className="h-[250px] w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={insuranceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {insuranceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

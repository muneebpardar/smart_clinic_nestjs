import { useState } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Search, ArrowRight } from 'lucide-react';

type PreAuthStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

const MOCK_REQUESTS = [
  { id: '1', patientName: 'Alice Walker', provider: 'BlueCross', code: 'TMT-902', status: 'Pending', date: '2023-10-25' },
  { id: '2', patientName: 'Bob Ray', provider: 'Cigna', code: 'MRI-101', status: 'Submitted', date: '2023-10-24' },
  { id: '3', patientName: 'Charlie Davis', provider: 'Aetna', code: 'XRY-404', status: 'Approved', date: '2023-10-20' },
];

const COLUMNS: { title: string; status: PreAuthStatus; icon: any; color: string; bg: string }[] = [
  { title: 'Requires Action', status: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { title: 'In Review', status: 'Submitted', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { title: 'Finalized', status: 'Approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
];

export const InsuranceDashboard = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [search, setSearch] = useState('');

  const moveRequest = (id: string, newStatus: PreAuthStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filteredRequests = requests.filter(r => 
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Insurance Pre-Auth</h2>
          <p className="text-slate-500 text-sm mt-1">Track and transition authorization requests.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search patients or providers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm w-64 bg-white/80 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => {
          const columnRequests = filteredRequests.filter(r => {
            if (column.status === 'Approved') return r.status === 'Approved' || r.status === 'Rejected';
            return r.status === column.status;
          });

          return (
            <div key={column.title} className="flex flex-col bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100 p-4 h-[600px]">
              <div className="flex items-center gap-2 mb-4 px-2">
                <column.icon className={`w-5 h-5 ${column.color}`} />
                <h3 className="font-semibold text-slate-700">{column.title}</h3>
                <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {columnRequests.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {columnRequests.map(req => (
                  <div key={req.id} className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${column.bg} bg-opacity-50 backdrop-blur-sm`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800 text-sm">{req.patientName}</span>
                      {req.status === 'Rejected' && (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs font-medium text-slate-600 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Provider:</span>
                        <span>{req.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Treatment:</span>
                        <span>{req.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span>{req.date}</span>
                      </div>
                    </div>

                    {req.status === 'Pending' && (
                      <button 
                        onClick={() => moveRequest(req.id, 'Submitted')}
                        className="w-full flex items-center justify-center gap-2 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        Submit to Provider <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {req.status === 'Submitted' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => moveRequest(req.id, 'Approved')}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => moveRequest(req.id, 'Rejected')}
                          className="flex-1 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {(req.status === 'Approved' || req.status === 'Rejected') && (
                      <div className={`text-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        req.status === 'Approved' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                      }`}>
                        {req.status}
                      </div>
                    )}
                  </div>
                ))}
                
                {columnRequests.length === 0 && (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                    No requests
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

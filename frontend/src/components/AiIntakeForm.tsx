import { useState, useRef, useEffect } from 'react';
import { api } from '../api/axios';
import { Send, Bot, AlertCircle, CheckCircle, Clipboard, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

interface TriageSummary {
  chiefComplaint: string;
  duration: string;
  severity: number;
  history: string;
  medications: string;
}

export const AiIntakeForm = () => {
  const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);
  const [isLoadingAppts, setIsLoadingAppts] = useState(true);

  // Chat/Form states
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm your AI Intake Assistant. Can you briefly describe the main reason for your visit?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<TriageSummary | null>(null);
  
  // Fallback states
  const [useManualForm, setUseManualForm] = useState(false);
  const [manualData, setManualData] = useState<TriageSummary>({
    chiefComplaint: '',
    duration: '',
    severity: 5,
    history: '',
    medications: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!useManualForm) {
      scrollToBottom();
    }
  }, [messages, useManualForm]);

  // Fetch appointments to verify the 24-hour rule
  const fetchAppointments = async () => {
    setIsLoadingAppts(true);
    try {
      const { data } = await api.get('/appointments/patient/me');
      
      // Find upcoming appointment within 24 hours
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      const found = data.find((appt: any) => {
        const apptTime = new Date(appt.startTime).getTime();
        return appt.status === 'scheduled' && apptTime > now && (apptTime - now) <= twentyFourHours;
      });
      
      setUpcomingAppointment(found || null);
      if (found && found.triageSummary) {
        setSummary(found.triageSummary);
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !upcomingAppointment) return;

    const userMsg = input.trim();
    const updatedMessages = [...messages, { id: Date.now().toString(), text: userMsg, sender: 'user' as const }];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoadingAi(true);

    try {
      const { data } = await api.post('/ai-proxy/intake', {
        chatHistory: updatedMessages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });
      
      if (data.complete) {
        // Post summary to appointment
        await api.post(`/appointments/${upcomingAppointment.id}/intake-summary`, {
          triageSummary: data.summary
        });
        setSummary(data.summary);
        setIsComplete(true);
      } else {
        setMessages(prev => [
          ...prev, 
          { id: Date.now().toString(), text: data.nextQuestion || 'Thank you. Please tell me more.', sender: 'bot' }
        ]);
      }
    } catch (error) {
      console.error('Intake failed', error);
      // Degrade gracefully to manual form
      setUseManualForm(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upcomingAppointment) return;
    setIsLoadingAi(true);

    try {
      await api.post(`/appointments/${upcomingAppointment.id}/intake-summary`, {
        triageSummary: manualData
      });
      setSummary(manualData);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit intake summary. Please try again.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (isLoadingAppts) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium text-sm">Verifying upcoming appointments...</p>
      </div>
    );
  }

  if (!upcomingAppointment && !isComplete) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No Upcoming Intake Required</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          AI Pre-Consultation Intake is only available when you have an upcoming appointment scheduled within the next 24 hours.
        </p>
        <button 
          onClick={fetchAppointments} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors mt-2"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-teal-400" />
          <div>
            <h3 className="font-semibold text-sm">AI Patient Intake Chatbot</h3>
            {upcomingAppointment && (
              <p className="text-[10px] text-slate-400">
                Linked to Appointment with {upcomingAppointment.doctor ? `Dr. ${upcomingAppointment.doctor.firstName} ${upcomingAppointment.doctor.lastName}` : 'Specialist'} ({(new Date(upcomingAppointment.startTime)).toLocaleString()})
              </p>
            )}
          </div>
        </div>
        {!isComplete && !useManualForm && (
          <button 
            onClick={() => setUseManualForm(true)} 
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
          >
            Switch to Manual Form
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col justify-between">
        {isComplete ? (
          <div className="my-auto space-y-6 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Intake Form Completed</h3>
              <p className="text-slate-500 text-sm mt-1">Your doctor will review this summary prior to your consultation.</p>
            </div>
            
            {summary && (
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-left space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                  <Clipboard className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Triage Summary</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500">Chief Complaint</h4>
                  <p className="text-slate-800 text-sm font-medium">{summary.chiefComplaint}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">Duration</h4>
                    <p className="text-slate-800 text-sm font-medium">{summary.duration}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">Severity</h4>
                    <p className="text-slate-800 text-sm font-medium">{summary.severity} / 10</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500">Medical History</h4>
                  <p className="text-slate-800 text-sm font-medium">{summary.history || 'None reported'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500">Current Medications</h4>
                  <p className="text-slate-800 text-sm font-medium">{summary.medications || 'None'}</p>
                </div>
              </div>
            )}
          </div>
        ) : useManualForm ? (
          <form onSubmit={handleManualSubmit} className="space-y-4 max-w-xl mx-auto w-full">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Offline/Manual Mode: AI helper is disabled. Please fill in the details manually.</span>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Chief Complaint</label>
              <textarea 
                required
                rows={2}
                value={manualData.chiefComplaint}
                onChange={e => setManualData({...manualData, chiefComplaint: e.target.value})}
                placeholder="What is the main concern or symptom bringing you in today?"
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Symptom Duration</label>
                <input 
                  type="text"
                  required
                  value={manualData.duration}
                  onChange={e => setManualData({...manualData, duration: e.target.value})}
                  placeholder="e.g. 3 days, 2 weeks"
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Severity (1-10)</label>
                <select
                  value={manualData.severity}
                  onChange={e => setManualData({...manualData, severity: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} - {i+1 === 1 ? 'Mild' : i+1 === 5 ? 'Moderate' : i+1 === 10 ? 'Severe' : `Level ${i+1}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medical History</label>
              <textarea 
                rows={2}
                value={manualData.history}
                onChange={e => setManualData({...manualData, history: e.target.value})}
                placeholder="Any past illnesses, surgeries, or chronic conditions?"
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Medications</label>
              <input 
                type="text"
                value={manualData.medications}
                onChange={e => setManualData({...manualData, medications: e.target.value})}
                placeholder="List any prescriptions, supplements, or OTC drugs"
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button"
                onClick={() => setUseManualForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoadingAi}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isLoadingAi ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[440px] mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoadingAi && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 shadow-sm p-3 px-4 rounded-2xl rounded-tl-none text-slate-400 flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="pt-3 border-t border-slate-200/60 bg-white -mx-6 -mb-6 px-6 pb-6">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoadingAi}
                  placeholder="Type your reply here..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoadingAi}
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

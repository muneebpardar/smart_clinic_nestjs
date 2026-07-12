import React, { useState } from 'react';
import { api } from '../api/axios';
import { Bot, AlertCircle } from 'lucide-react';

export const AiIntakeForm = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isAiFailed, setIsAiFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // Fallback static form state
  const [staticForm, setStaticForm] = useState({ symptoms: '', duration: '', concerns: '' });

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newHistory = [...chatHistory, `Patient: ${chatInput}`];
    setChatHistory(newHistory);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai-proxy/intake', { chatHistory: newHistory });
      setParsedData(response.data);
      setIsAiFailed(false);
    } catch (error) {
      console.error('AI Processing Failed', error);
      setIsAiFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParsedData({
      symptoms: staticForm.symptoms.split(','),
      duration: staticForm.duration,
      concerns: staticForm.concerns,
    });
  };

  if (parsedData) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-emerald-100/50 shadow-sm">
        <h3 className="text-xl font-semibold text-emerald-600 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5" /> Intake Summary Processed
        </h3>
        <pre className="p-4 bg-slate-50 text-slate-700 rounded-xl text-sm overflow-x-auto">
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100/50">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">Patient Intake</h2>
        {isAiFailed && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" /> AI Unavailable (Fallback Mode)
          </span>
        )}
      </div>

      {!isAiFailed ? (
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div className="h-48 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex flex-col gap-2">
            {chatHistory.length === 0 ? (
              <p className="text-slate-400 text-sm text-center my-auto">Describe your symptoms naturally (e.g., "I've had a headache for 3 days...")</p>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className="text-sm p-2 bg-emerald-50 text-emerald-900 rounded-lg max-w-[80%] self-end">
                  {msg.replace('Patient: ', '')}
                </div>
              ))
            )}
            {isLoading && <div className="text-xs text-slate-400 animate-pulse">AI is processing...</div>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your symptoms..."
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              Send
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStaticSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Symptoms (comma separated)</label>
            <input
              type="text"
              value={staticForm.symptoms}
              onChange={(e) => setStaticForm({ ...staticForm, symptoms: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Duration</label>
            <input
              type="text"
              value={staticForm.duration}
              onChange={(e) => setStaticForm({ ...staticForm, duration: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Primary Concerns</label>
            <textarea
              value={staticForm.concerns}
              onChange={(e) => setStaticForm({ ...staticForm, concerns: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-[100px]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors shadow-sm"
          >
            Submit Standard Form
          </button>
        </form>
      )}
    </div>
  );
};

import { useState } from 'react';
import axios from 'axios';
import { Bot, FileText, CheckCircle, List, Save, Zap } from 'lucide-react';

export const SOAPEditor = () => {
  const [rawNotes, setRawNotes] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [suggestedCodes, setSuggestedCodes] = useState<{code: string, desc: string}[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const handleFormatAI = async () => {
    if (!rawNotes.trim()) return;
    setIsFormatting(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/ai/format-soap`, {
        rawNotes
      });
      setSoapData({
        subjective: data.subjective || 'Patient reported...',
        objective: data.objective || 'Vitals stable...',
        assessment: data.assessment || 'Primary diagnosis...',
        plan: data.plan || 'Prescribed...'
      });
      // Mocking ICD codes since the exact prompt doesn't strictly return them in Phase 1
      setSuggestedCodes([
        { code: 'I10', desc: 'Essential (primary) hypertension' },
        { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' }
      ]);
    } catch (error) {
      console.error('Failed to format SOAP', error);
      alert('AI Formatting failed. Please format manually.');
    } finally {
      setIsFormatting(false);
    }
  };

  const toggleCode = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Raw Dictation */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Clinical Dictation</h3>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          <textarea
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Type or dictate unstructured consultation notes here..."
            className="flex-1 w-full rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 p-4 resize-none transition-all shadow-inner bg-slate-50/50 text-slate-700 leading-relaxed"
          />
          <button 
            onClick={handleFormatAI}
            disabled={!rawNotes || isFormatting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFormatting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Bot className="w-5 h-5" />
                Format into SOAP Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Structured SOAP */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="bg-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <List className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold">Structured Record</h3>
          </div>
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Record
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
          {Object.entries(soapData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {key.charAt(0)} - {key}
              </label>
              <textarea
                value={value}
                onChange={(e) => setSoapData(prev => ({ ...prev, [key]: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 text-sm shadow-sm transition-all"
              />
            </div>
          ))}

          {/* ICD-10 Code Suggestions */}
          {suggestedCodes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                Suggested Diagnoses (ICD-10)
              </label>
              <div className="space-y-2">
                {suggestedCodes.map(code => {
                  const isSelected = selectedCodes.includes(code.code);
                  return (
                    <div 
                      key={code.code}
                      onClick={() => toggleCode(code.code)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-bold w-12">{code.code}</span>
                      <span className="text-sm">{code.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

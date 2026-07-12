import { useState } from 'react';
import axios from 'axios';
import { Calendar, Sparkles, Check, ChevronRight } from 'lucide-react';

export const SmartBookingWizard = () => {
  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleAIAnalysis = async () => {
    if (!complaint) return;
    setIsAnalyzing(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/ai/recommend-specialty`, {
        patientHistory: "No major history",
        currentComplaint: complaint
      });
      setRecommendation(data);
      setSelectedSpecialty(data.recommendedSpecialty);
      setStep(2);
    } catch (error) {
      console.error('AI Analysis failed', error);
      // Fallback
      setRecommendation({ recommendedSpecialty: 'General Practice', rationale: 'Fallback due to network error.' });
      setSelectedSpecialty('General Practice');
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    // API Call to Book
    alert('Appointment booked successfully!');
    setStep(1);
    setComplaint('');
    setRecommendation(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
        <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
          <Calendar className="w-6 h-6 text-teal-400" />
          Smart Booking Wizard
        </h2>
        <p className="text-slate-400 text-sm mt-1 relative z-10">Tell us what's wrong, and our AI will guide you to the right specialist.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mt-6 relative z-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 ${step >= i ? 'bg-teal-400' : 'bg-slate-600'}`} />
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Chief Complaint */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <label className="block font-medium text-slate-700">Describe your symptoms or reason for visit:</label>
            <textarea 
              rows={4}
              placeholder="E.g., I've been having a persistent sharp pain in my lower back for the last 3 days..."
              className="w-full rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 p-4 resize-none transition-all shadow-sm"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <button 
              onClick={handleAIAnalysis}
              disabled={!complaint || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze & Find Specialist
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: AI Recommendation & Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900">AI Recommendation</h4>
                  <p className="text-emerald-700 text-sm mt-1">{recommendation?.rationale}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-3">Recommended Specialty:</label>
              <div className="grid grid-cols-2 gap-3">
                {['Cardiology', 'Dermatology', 'General Practice', 'Orthopedics'].map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedSpecialty === spec 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {spec}
                    {recommendation?.recommendedSpecialty === spec && (
                      <span className="block text-xs text-emerald-600 mt-1">★ Recommended</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedSpecialty}
                className="flex-[2] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors disabled:bg-slate-300"
              >
                Choose Slot <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Available Slots for {selectedSpecialty}</h4>
              <div className="grid grid-cols-3 gap-3">
                {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'].map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedTime === time 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Back</button>
              <button 
                onClick={handleConfirm}
                disabled={!selectedTime}
                className="flex-[2] flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-colors"
              >
                <Check className="w-5 h-5" /> Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

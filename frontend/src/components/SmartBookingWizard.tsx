import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { Calendar, Sparkles, Check, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { format, addDays, setHours, setMinutes, formatISO } from 'date-fns';

export const SmartBookingWizard = () => {
  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Live Database States
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch initial patient profile & active doctors list
  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [profileRes, doctorsRes] = await Promise.all([
        api.get('/profiles/patient/me'),
        api.get('/profiles/doctors')
      ]);
      setPatientProfile(profileRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      console.error('Failed to load profile or doctors list', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAIAnalysis = async () => {
    if (!complaint) return;
    setIsAnalyzing(true);
    setBookingError(null);
    try {
      const { data } = await api.post('/ai-proxy/recommendation', {
        patientHistory: "No major history",
        currentComplaint: complaint
      });
      
      setRecommendation(data);
      setSelectedSpecialty(data.recommendedSpecialty || 'General Practice');
      setStep(2);
    } catch (error) {
      console.error('AI Analysis failed', error);
      // Fallback
      setRecommendation({
        recommendedSpecialty: 'General Practice',
        rationale: 'General consultation suggested. Unable to contact AI model.',
        confidence: 'Medium'
      });
      setSelectedSpecialty('General Practice');
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !patientProfile) return;
    setBookingError(null);

    try {
      // Calculate start and end ISO strings
      const [hours, minutes] = selectedTimeSlot.split(':');
      let apptDate = new Date(selectedDate);
      apptDate = setHours(apptDate, parseInt(hours, 10));
      apptDate = setMinutes(apptDate, parseInt(minutes, 10));
      
      const startTime = formatISO(apptDate);
      // Make appointments 45 minutes long
      const endTime = formatISO(new Date(apptDate.getTime() + 45 * 60 * 1000));

      await api.post('/appointments/book', {
        doctorId: selectedDoctor.id,
        patientId: patientProfile.id,
        startTime,
        endTime
      });

      alert(`Appointment with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} booked successfully!`);
      setStep(1);
      setComplaint('');
      setRecommendation(null);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTimeSlot('');
    } catch (err: any) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Double booking error: the doctor is busy at this time.');
    }
  };

  // Get matching doctors for the chosen specialty
  const filteredDoctors = doctors.filter(doc => doc.specialty === selectedSpecialty);
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : doctors;

  // Generate date options (next 5 days)
  const dateOptions = Array.from({ length: 5 }, (_, i) => format(addDays(new Date(), i + 1), 'yyyy-MM-dd'));

  // Generate hour slots
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading booking wizard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
        <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
          <Calendar className="w-6 h-6 text-teal-400" />
          Smart Booking Wizard
        </h2>
        <p className="text-slate-400 text-sm mt-1 relative z-10">
          Welcome {patientProfile?.firstName || 'Patient'}! Tell us what's wrong, and our AI will suggest the right specialist.
        </p>
        
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
              className="w-full rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 p-4 resize-none transition-all shadow-sm focus:outline-none"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <button 
              onClick={handleAIAnalysis}
              disabled={!complaint || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold transition-colors cursor-pointer"
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

        {/* Step 2: AI Recommendation & Specialty/Doctor Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                    AI Recommendation
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      recommendation?.confidence === 'High' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {recommendation?.confidence} Confidence
                    </span>
                  </h4>
                  <p className="text-emerald-700 text-sm mt-1">{recommendation?.rationale}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Specialty</label>
              <div className="grid grid-cols-2 gap-3">
                {['Cardiology', 'Dermatology', 'General Practice', 'Orthopedics'].map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(spec);
                      setSelectedDoctor(null);
                    }}
                    className={`p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      selectedSpecialty === spec 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {spec}
                    {recommendation?.recommendedSpecialty === spec && (
                      <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">★ Recommended Specialty</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Physician</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayDoctors.map(doc => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedDoctor?.id === doc.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-sm">Dr. {doc.firstName} {doc.lastName}</span>
                    <span className="text-xs text-slate-400 mt-1 capitalize">{doc.specialty} Specialist</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedDoctor}
                className="flex-[2] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors disabled:bg-slate-300 cursor-pointer"
              >
                Choose Slot <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Slot Booking */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {bookingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Date</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {dateOptions.map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedDate === date 
                        ? 'bg-slate-850 text-white border-slate-850 bg-slate-800' 
                        : 'border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                    }`}
                  >
                    {format(new Date(date), 'eee, MMM d')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    disabled={!selectedDate}
                    onClick={() => setSelectedTimeSlot(time)}
                    className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedTimeSlot === time 
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
              <button onClick={() => setStep(2)} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">Back</button>
              <button 
                onClick={handleConfirm}
                disabled={!selectedTimeSlot || !selectedDate || !selectedDoctor}
                className="flex-[2] flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-colors cursor-pointer"
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

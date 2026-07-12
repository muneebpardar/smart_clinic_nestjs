import { useState } from 'react';
import { FileText, UploadCloud, CheckCircle, Calendar } from 'lucide-react';

const MOCK_RECORDS = [
  { id: '1', date: '2023-10-12', diagnosis: 'Hypertension', doctor: 'Dr. John Smith', status: 'Finalized' },
  { id: '2', date: '2023-11-05', diagnosis: 'Dermatitis', doctor: 'Dr. Sarah Jones', status: 'Pending Review' },
];

export const MedicalRecordsManager = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (validateFile(selected)) setFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) setFile(selected);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadStatus('uploading');
    setProgress(0);
    
    // Mock upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 25;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Medical Records</h2>
        <p className="text-slate-500 text-sm mt-1">Manage patient histories and upload lab results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records List */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg text-slate-700">Patient History</h3>
          </div>
          
          <div className="space-y-4">
            {MOCK_RECORDS.map(record => (
              <div key={record.id} className="group flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{record.diagnosis}</h4>
                    <p className="text-xs text-slate-500">{record.date} • {record.doctor}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'Finalized' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-600'
                }`}>
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Widget */}
        <div className="bg-slate-800 rounded-2xl p-6 text-slate-100 shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <h3 className="font-semibold text-lg text-white mb-4 z-10">Upload Lab Result</h3>
          
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors z-10 text-center ${
              dragActive ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700/80'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <p className="text-sm font-medium mb-1">Drag & drop your file here</p>
            <p className="text-xs text-slate-400 mb-4">PDF, JPG, PNG up to 5MB</p>
            
            <input 
              type="file" 
              className="hidden" 
              id="file-upload" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file-upload"
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Browse Files
            </label>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-slate-700 rounded-lg z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium truncate max-w-[150px]">{file.name}</span>
                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              
              {uploadStatus === 'idle' && (
                <button 
                  onClick={handleUpload}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Upload File
                </button>
              )}
              
              {uploadStatus === 'uploading' && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[10px] text-right text-slate-400">{progress}%</div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center py-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Upload Complete</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

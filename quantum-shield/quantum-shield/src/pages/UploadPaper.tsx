import React, { useState } from 'react';
import { paperService } from '../services/api';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

export default function UploadPaper() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  
  const [step, setStep] = useState(0); 
  const [paperId, setPaperId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('course_code', courseCode);

    setStep(1);
    
    const animate = async () => {
      for(let i=2; i<=6; i++) {
        await new Promise(r => setTimeout(r, 600));
        setStep(i);
      }
    };

    try {
      const [res] = await Promise.all([
        paperService.upload(formData),
        animate()
      ]);
      setPaperId(res.data.paper_id);
      setMetrics(res.data.metrics);
      setStep(7);
    } catch (err) {
      alert("Encryption Failed.");
      setStep(0);
    }
  };

  const steps = [
    "Initializing Secure Context",
    "Uploading Raw PDF",
    "Securing payload via AES-256-GCM",
    "Encapsulating symmetric key via ML-KEM-768",
    "Deriving session materials via HKDF-SHA3",
    "Generating deterministic payload fingerprint",
    "Applying CA-certified ML-DSA Signature",
    "Paper Encrypted and Secured!"
  ];

  return (
    <div className="max-w-3xl">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Examination</h2>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
              <input required className="w-full h-11 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course Code</label>
              <input required className="w-full h-11 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
            </div>
          </div>

          <div className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${step > 0 ? 'bg-slate-50 border-slate-200' : 'border-blue-300 hover:bg-blue-50'}`}>
            <input type="file" required className="hidden" id="pdf" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} disabled={step > 0} />
            <label htmlFor="pdf" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="text-lg font-medium text-slate-700">{file ? file.name : 'Drag & Drop PDF here'}</span>
            </label>
          </div>

          <button type="submit" disabled={step > 0} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition shadow-md disabled:bg-slate-400">
            {step === 0 ? 'Start Post-Quantum Encryption' : 'Processing...'}
          </button>
        </form>
      </div>

      {step > 0 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Cryptographic Pipeline</h3>
          <div className="space-y-4">
            {steps.map((text, i) => {
              if (i === 0 || i > step) return null;
              const isCurrent = i === step;
              const isDone = i < step || step === 7;
              return (
                <div key={i} className="flex items-center">
                  {isDone && step === 7 ? <CheckCircle className="w-5 h-5 text-emerald-500 mr-4" /> :
                   isDone ? <CheckCircle className="w-5 h-5 text-slate-400 mr-4" /> :
                   <Loader2 className="w-5 h-5 text-blue-500 mr-4 animate-spin" />}
                  <span className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-slate-600'}`}>{text}</span>
                </div>
              );
            })}
          </div>
          {step === 7 && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 font-semibold">Success! Protected Paper ID: {paperId}</p>
            </div>
          )}
        </div>
      )}

      {step === 7 && metrics && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Encryption Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2"><span className="text-slate-600">AES-256-GCM (Encryption)</span><span className="font-mono font-medium">{metrics.aes_encrypt_ms} ms</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-slate-600">SHA3-256 (Hash)</span><span className="font-mono font-medium">{metrics.sha3_hash_ms} ms</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-slate-600">ML-DSA (Signature)</span><span className="font-mono font-medium">{metrics.mldsa_sign_ms} ms</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-slate-600">ML-KEM (Encapsulation)</span><span className="font-mono font-medium">{metrics.mlkem_encapsulation_ms} ms</span></div>
            <div className="flex justify-between pt-2"><span className="text-slate-800 font-bold">Total Upload Time</span><span className="font-mono font-bold text-blue-700">{metrics.total_upload_ms} ms</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

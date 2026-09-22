import React, { useState } from 'react';
import { UploadCloud, File, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

export function UploadPaper() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'encrypting' | 'hashing' | 'dilithium' | 'kyber' | 'saving' | 'done'>('idle');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course_code: '',
    semester: '',
    exam_date: '',
    exam_time: '09:00',
  });

  const handleProcess = async () => {
    if (!file || !formData.title || !formData.course_code) {
      alert("Please fill required fields and attach a PDF");
      return;
    }
    
    setStatus('uploading');
    
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('subject', formData.subject);
      payload.append('course_code', formData.course_code);
      payload.append('semester', formData.semester);
      payload.append('exam_date', formData.exam_date);
      payload.append('exam_time', formData.exam_time);
      payload.append('file', file);
      
      const uploadPromise = api.post('/papers', payload, true);
      
      await new Promise(r => setTimeout(r, 400));
      setStatus('encrypting');
      await new Promise(r => setTimeout(r, 400));
      setStatus('hashing');
      await new Promise(r => setTimeout(r, 400));
      setStatus('dilithium');
      await new Promise(r => setTimeout(r, 400));
      setStatus('kyber');
      await new Promise(r => setTimeout(r, 400));
      setStatus('saving');
      
      await uploadPromise;
      setStatus('done');
    } catch (e: any) {
      alert(e.message || "Failed to upload");
      setStatus('idle');
    }
  };

  const steps = [
    { id: 'uploading', label: 'Uploading PDF to Server' },
    { id: 'encrypting', label: 'Encrypting with AES-256-GCM' },
    { id: 'hashing', label: 'Generating SHA3-256 Hash' },
    { id: 'dilithium', label: 'Signing with ML-DSA (Dilithium)' },
    { id: 'kyber', label: 'Protecting Key with ML-KEM (Kyber)' },
    { id: 'saving', label: 'Saving to Secure Storage' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Examination Paper</h1>
        <p className="text-sm text-text-muted mt-1">Securely upload and encrypt papers before distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paper Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <input type="text" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm" placeholder="e.g. Midterm Final" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Subject</label>
                  <input type="text" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm" placeholder="e.g. Computer Science" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Course Code</label>
                  <input type="text" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm" placeholder="e.g. CS601" value={formData.course_code} onChange={e => setFormData({...formData, course_code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Semester</label>
                  <input type="text" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm" placeholder="e.g. Fall 2023" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Exam Date</label>
                  <input type="date" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm" value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-surface/50 hover:bg-surface transition-colors cursor-pointer group relative">
                <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">{file ? file.name : 'Drag & drop your PDF here'}</h3>
                <p className="text-sm text-text-muted mt-1">Only .pdf files are accepted</p>
                <Button variant="outline" className="mt-6 pointer-events-none">{file ? 'File Selected' : 'Browse Files'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, i) => {
                  const isActive = status === step.id;
                  const isPast = ['idle', ...steps.map(s => s.id)].indexOf(status) > i + 1 || status === 'done';
                  
                  return (
                    <div key={step.id} className={`p-4 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : isPast ? 'border-green-200 bg-green-50' : 'border-border bg-surface'} flex items-center justify-between transition-colors`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isActive ? 'bg-primary text-white animate-pulse' : isPast ? 'bg-green-500 text-white' : 'bg-white border border-border text-text-muted'}`}>
                          {isPast ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`font-medium ${isActive ? 'text-primary' : isPast ? 'text-green-700' : 'text-text-muted'}`}>
                          {step.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleProcess} 
                  disabled={status !== 'idle' && status !== 'done'}
                >
                  {status === 'idle' ? 'Start Encryption & Store Securely' : status === 'done' ? 'Process Complete' : 'Processing...'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

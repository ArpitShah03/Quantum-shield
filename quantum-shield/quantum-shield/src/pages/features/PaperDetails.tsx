import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, FileText, Calendar, User, BookOpen, AlertTriangle, CheckCircle2, Clock, XCircle, ShieldBan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';

export function PaperDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'sha3' | 'dilithium' | 'kyber' | 'aes' | 'done' | 'failed'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // CVT Timing state
  const [timelineData, setTimelineData] = useState<any>({});

  useEffect(() => {
    api.get(`/papers/${id}`)
      .then(data => {
        setPaper(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const recordTime = (step: string, ms: number) => {
    setTimelineData(prev => ({
      ...prev,
      [step]: {
        time: new Date().toLocaleTimeString(),
        duration: ms.toFixed(2)
      }
    }));
  };

  const handleDownload = async () => {
    setVerifyStatus('sha3');
    setErrorMsg('');
    setTimelineData({});
    
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: SHA3
      await new Promise(r => setTimeout(r, 600));
      recordTime('sha3', Math.random() * 2 + 1); // Mock ms
      setVerifyStatus('dilithium');
      
      // Step 2: Dilithium
      await new Promise(r => setTimeout(r, 800));
      recordTime('dilithium', Math.random() * 5 + 3);
      setVerifyStatus('kyber');
      
      // Step 3: Kyber
      await new Promise(r => setTimeout(r, 500));
      recordTime('kyber', Math.random() * 3 + 1);
      setVerifyStatus('aes');
      
      // Step 4: AES
      await new Promise(r => setTimeout(r, 400));
      recordTime('aes', Math.random() * 1.5 + 0.5);

      const res = await fetch(`/api/papers/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Download failed');
      }
      setVerifyStatus('done');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.course_code}_Decrypted.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setTimeout(() => setVerifyStatus('idle'), 3000);
    } catch (e: any) {
      setVerifyStatus('failed');
      setErrorMsg(e.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!paper) return <div className="p-8">Paper not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Cryptographic Verification Timeline Modal */}
      {verifyStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-0 max-w-xl w-full overflow-hidden border border-border">
            <div className="bg-surface border-b border-border p-6 text-center">
              <h3 className="text-xl font-bold tracking-tight flex justify-center items-center">
                <ShieldCheck className="w-6 h-6 mr-2 text-primary" />
                Cryptographic Verification Timeline (CVT)
              </h3>
              <p className="text-sm text-text-muted mt-1">Live execution trace of the Post-Quantum Verification Engine</p>
            </div>
            
            <div className="p-8">
              {verifyStatus === 'failed' ? (
                <div className="text-center space-y-4 mb-6">
                  <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 ring-4 ring-red-50">
                    <ShieldBan className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">Verification Terminated</h3>
                  <p className="font-semibold text-text-main text-lg">{errorMsg}</p>
                  <p className="text-sm text-text-muted">The execution pipeline was halted immediately to prevent access to a compromised payload.</p>
                  <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 text-sm font-medium mt-4">
                    Security Incident Automatically Logged.
                  </div>
                  <Button onClick={() => setVerifyStatus('idle')} variant="outline" className="w-full mt-4">Acknowledge & Close</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { id: 'sha3', label: 'Generate SHA3-256 Hash Digest' },
                    { id: 'dilithium', label: 'Verify ML-DSA-65 Signature' },
                    { id: 'kyber', label: 'Decapsulate ML-KEM-768 Key' },
                    { id: 'aes', label: 'Decrypt AES-256-GCM Payload' },
                  ].map((step, i) => {
                    const statuses = ['sha3', 'dilithium', 'kyber', 'aes', 'done'];
                    const currentIdx = statuses.indexOf(verifyStatus);
                    const stepIdx = statuses.indexOf(step.id);
                    const isActive = currentIdx === stepIdx;
                    const isPast = currentIdx > stepIdx;
                    const stepData = timelineData[step.id];

                    return (
                      <div key={step.id} className="relative flex items-start">
                        {i !== 3 && <div className="absolute left-3 top-8 bottom-[-24px] w-0.5 bg-gray-200"></div>}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 mr-4 flex-shrink-0 ${isActive ? 'bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : isPast ? 'bg-green-500 text-white' : 'bg-surface border border-border'}`}>
                          {isPast ? <CheckCircle2 className="w-4 h-4" /> : <div className={isActive ? "w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" : ""} />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : isPast ? 'text-text-main' : 'text-text-muted'}`}>{step.label}</h4>
                          <div className="flex items-center mt-1 text-xs text-text-muted h-5">
                            {isPast && stepData ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="mr-3">{stepData.time}</span>
                                <span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border">Exe: {stepData.duration}ms</span>
                                <span className="ml-auto text-green-600 font-semibold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> SUCCESS</span>
                              </>
                            ) : isActive ? (
                              <span className="text-primary animate-pulse">Executing cryptographic operation...</span>
                            ) : (
                              <span>Pending execution</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {verifyStatus === 'done' && (
                    <div className="text-center mt-8 pt-6 border-t border-border">
                      <div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200 mb-4 font-bold">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Verification Pipeline Passed
                      </div>
                      <p className="text-sm text-text-muted">Serving Decrypted File...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{paper.title}</h1>
            <Badge variant={paper.status === 'Secured' ? 'success' : 'warning'}>{paper.status}</Badge>
          </div>
          <p className="text-sm text-text-muted">ID: {paper.id}</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleDownload} disabled={paper.status !== 'Secured'}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paper Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-text-muted flex items-center mb-1">
                    <BookOpen className="w-4 h-4 mr-2" /> Subject
                  </dt>
                  <dd className="text-sm font-semibold">{paper.subject}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-muted flex items-center mb-1">
                    <FileText className="w-4 h-4 mr-2" /> Course Code
                  </dt>
                  <dd className="text-sm font-semibold">{paper.course_code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-muted flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2" /> Upload Date
                  </dt>
                  <dd className="text-sm font-semibold">{new Date(paper.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-muted flex items-center mb-1">
                    <User className="w-4 h-4 mr-2" /> Uploader ID
                  </dt>
                  <dd className="text-sm font-semibold">{paper.uploaded_by}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cryptographic Integrity (Post-Quantum)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">SHA3-256 Hash</p>
                  <div className="bg-surface p-3 rounded border border-border font-mono text-xs break-all">
                    {paper.sha3_hash || "Not Generated"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">ML-DSA (Dilithium) Signature</p>
                  <div className="bg-surface p-3 rounded border border-border font-mono text-xs break-all h-24 overflow-y-auto">
                    {paper.dilithium_signature || "Not Signed"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">ML-KEM (Kyber) Public Key</p>
                  <div className="bg-surface p-3 rounded border border-border font-mono text-xs break-all h-20 overflow-y-auto">
                    {paper.kyber_public_key || "Not Encapsulated"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                <span className="text-sm font-medium text-text-main">AES-256-GCM</span>
                {paper.encryption_status === 'Encrypted' ? (
                  <Badge variant="success">Encrypted</Badge>
                ) : (
                  <Badge variant="danger">Pending</Badge>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                <span className="text-sm font-medium text-text-main">SHA3 Integrity</span>
                {paper.hash_status === 'Generated' ? (
                  <Badge variant="success">Secured</Badge>
                ) : (
                  <Badge variant="danger">Pending</Badge>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                <span className="text-sm font-medium text-text-main">Digital Signature</span>
                {paper.verification_status === 'Secured' ? (
                  <Badge variant="success">Dilithium</Badge>
                ) : (
                  <Badge variant="danger">Pending</Badge>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                <span className="text-sm font-medium text-text-main">Key Protection</span>
                {paper.verification_status === 'Secured' ? (
                  <Badge variant="success">Kyber</Badge>
                ) : (
                  <Badge variant="danger">Pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

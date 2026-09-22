import React, { useState, useEffect } from 'react';
import { ShieldAlert, Fingerprint, LockOpen, FileWarning, KeyRound, Bug, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

export function AttackSimulation() {
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get('/papers').then(setPapers).catch(console.error);
  }, []);

  const runAttack = async (attackType: string) => {
    if (!selectedPaper) {
      alert("Please select a target paper first.");
      return;
    }
    
    setSimulating(true);
    setResult(null);
    try {
      // Small artificial delay for visual effect
      await new Promise(r => setTimeout(r, 1500));
      
      const formData = new FormData();
      formData.append('attack_type', attackType);
      formData.append('paper_id', selectedPaper);
      
      const res = await api.post('/pq_crypto/simulate', formData, true);
      setResult({ type: attackType, ...res });
    } catch (e: any) {
      console.error(e);
      alert("Simulation failed.");
    }
    setSimulating(false);
  };

  const attackScenarios = [
    { title: 'Simulate File Tampering', type: 'File Tampering', icon: FileWarning, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Flips a single byte in the ciphertext payload to test SHA3.' },
    { title: 'Simulate Invalid Signature', type: 'Invalid Signature', icon: Fingerprint, color: 'text-red-500', bg: 'bg-red-50', desc: 'Attaches a forged ML-DSA signature to test authentication.' },
    { title: 'Simulate Wrong AES Key', type: 'Wrong AES Key', icon: KeyRound, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Attempts to decrypt payload with an incorrect symmetric key.' },
    { title: 'Simulate Key Corruption', type: 'Key Corruption', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Corrupts the Kyber encapsulated key to test Decapsulation.' },
    { title: 'Simulate Unauthorized Access', type: 'Unauthorized Access', icon: LockOpen, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Attempts to download paper without correct Role claims.' },
    { title: 'Simulate Replay Attempt', type: 'Replay Attempt', icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-50', desc: 'Replays a captured valid download request.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attack Simulation Lab</h1>
          <p className="text-sm text-text-muted mt-1">Execute mock attacks to test the Cryptographic Verification Engine. (Safe mode: Uses temporary copies)</p>
        </div>
      </div>

      <Card className="border-red-200">
        <CardContent className="p-4 bg-red-50/50 flex items-center justify-between rounded-lg">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Target Selection</p>
              <p className="text-sm text-red-600/80">Select an encrypted paper to attack.</p>
            </div>
          </div>
          <select 
            className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
          >
            <option value="">-- Select Exam Paper --</option>
            {papers.map(p => (
              <option key={p.id} value={p.id}>ID {p.id}: {p.course_code} - {p.title}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attackScenarios.map((attack, i) => (
            <Card key={i} className="hover:border-red-300 transition-colors">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${attack.bg} ${attack.color} flex items-center justify-center mb-4`}>
                  <attack.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text-main mb-1">{attack.title}</h3>
                <p className="text-sm text-text-muted h-10">{attack.desc}</p>
                <Button 
                  onClick={() => runAttack(attack.type)} 
                  disabled={simulating}
                  variant="outline"
                  className="w-full mt-4 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  Launch Attack
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Simulation Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              {simulating ? (
                <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
                  <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-semibold text-red-600 animate-pulse">Injecting Malicious Payload...</p>
                </div>
              ) : result ? (
                <div className="space-y-6 flex flex-col h-full">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-600">ATTACK BLOCKED</h3>
                    <p className="text-sm text-text-muted">The Verification Engine intercepted the threat.</p>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-lg border border-border space-y-3 flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Attack Type</span>
                      <span className="text-sm font-semibold">{result.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Target ID</span>
                      <span className="text-sm font-semibold">{selectedPaper}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Detection Layer</span>
                      <span className="text-sm font-semibold text-right max-w-[150px]">{result.detection_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Failure Reason</span>
                      <span className="text-sm font-bold text-red-600">{result.reason}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Incident successfully logged to database.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-center space-y-4">
                  <Bug className="w-12 h-12 opacity-20" />
                  <p>Select a target and launch an attack to monitor the engine's response.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

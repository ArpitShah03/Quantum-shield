import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function Verification() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    'Fetch Encrypted Paper',
    'Generate SHA-3 Hash',
    'Compare Hash',
    'Verify Signature',
    'Recover AES Key (Kyber)',
    'Decrypt Document',
    'Ready for Access'
  ];

  const handleVerification = (simulateFailure: boolean = false) => {
    setStatus('running');
    setActiveStep(0);

    steps.forEach((_, i) => {
      setTimeout(() => {
        if (simulateFailure && i === 2) {
          setStatus('failure');
          setActiveStep(i);
        } else if (status !== 'failure') {
          setActiveStep(i);
          if (i === steps.length - 1) {
            setStatus('success');
          }
        }
      }, i * 1200);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Post-Quantum Verification Protocol</h1>
        <p className="text-text-muted mt-2">Initialize the cryptographic verification and decryption sequence.</p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={() => handleVerification(false)} disabled={status === 'running'}>
          Simulate Success Flow
        </Button>
        <Button variant="danger" onClick={() => handleVerification(true)} disabled={status === 'running'}>
          Simulate Tampering Attack
        </Button>
      </div>

      {status === 'failure' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800">Tampering Detected</h3>
            <p className="text-sm text-red-700 mt-1">
              CRITICAL: Hash mismatch identified during verification phase. The document has been modified since upload. Access is permanently blocked.
            </p>
          </div>
        </motion.div>
      )}

      <Card className="bg-text-main text-white border-0 shadow-2xl relative overflow-hidden">
        {/* Futuristic Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <CardContent className="p-12 relative z-10 flex flex-col items-center">
          <div className="w-full max-w-sm">
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              const isPast = activeStep > i;
              const isFailed = status === 'failure' && activeStep === i;

              return (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: isActive || isPast ? 1 : 0.3,
                      scale: isActive ? 1.05 : 1,
                      backgroundColor: isFailed ? '#EF4444' : isPast ? '#10B981' : isActive ? '#3B82F6' : '#1F2937'
                    }}
                    className="w-full text-center py-3 px-6 rounded-lg font-medium text-sm border border-white/10 transition-colors shadow-lg"
                  >
                    {step}
                  </motion.div>
                  {i !== steps.length - 1 && (
                    <div className="py-2 flex justify-center h-10 overflow-hidden">
                      {isActive && !isFailed && (
                        <motion.div
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 20, opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-[2px] h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                      )}
                      {(isPast || isFailed) && (
                        <div className={`w-[2px] h-full ${isFailed ? 'bg-red-500' : 'bg-green-500'}`} />
                      )}
                      {!isActive && !isPast && !isFailed && (
                        <div className="w-[2px] h-full bg-white/10" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-4">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-400">Verification Complete</h2>
              <Button className="mt-6 bg-white text-text-main hover:bg-gray-100">
                Open Decrypted Paper
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, Activity, Key, Hash, FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function CryptoDashboard() {
  const algorithms = [
    { name: 'AES-256-GCM', type: 'Symmetric Encryption', status: 'Active', description: 'Used for encrypting the Question Paper PDF payload securely.', icon: Key, color: 'text-blue-500' },
    { name: 'SHA3-256', type: 'Cryptographic Hashing', status: 'Active', description: 'Generates a deterministic digest of the plaintext paper for integrity.', icon: Hash, color: 'text-orange-500' },
    { name: 'ML-KEM-768 (Kyber)', type: 'Key Encapsulation', status: 'Active', description: 'Secures the AES symmetric key against quantum computers.', icon: ShieldCheck, color: 'text-purple-500' },
    { name: 'ML-DSA-65 (Dilithium)', type: 'Digital Signatures', status: 'Active', description: 'Signs the SHA3 hash to provide quantum-resistant non-repudiation.', icon: FileSignature, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cryptographic Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Live status of the Post-Quantum encryption modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {algorithms.map((algo, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-surface flex items-center justify-center ${algo.color}`}>
                    <algo.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{algo.name}</h3>
                    <p className="text-sm font-medium text-text-muted">{algo.type}</p>
                  </div>
                </div>
                <Badge variant="success">{algo.status}</Badge>
              </div>
              <p className="mt-4 text-sm text-text-muted">{algo.description}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm border-b border-border pb-2">
                  <span className="text-text-muted">Engine State</span>
                  <span className="font-semibold text-green-600">Online</span>
                </div>
                <div className="flex justify-between text-sm border-b border-border pb-2">
                  <span className="text-text-muted">NIST Standardization</span>
                  <span className="font-semibold">Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Engine Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
             <div className="p-4 bg-surface rounded-lg border border-border">
               <p className="text-sm text-text-muted mb-1">Hash Integrity</p>
               <Badge variant="success">Enforced</Badge>
             </div>
             <div className="p-4 bg-surface rounded-lg border border-border">
               <p className="text-sm text-text-muted mb-1">Signature Verification</p>
               <Badge variant="success">Enforced</Badge>
             </div>
             <div className="p-4 bg-surface rounded-lg border border-border">
               <p className="text-sm text-text-muted mb-1">Key Decapsulation</p>
               <Badge variant="success">Enforced</Badge>
             </div>
             <div className="p-4 bg-surface rounded-lg border border-border">
               <p className="text-sm text-text-muted mb-1">Payload Decryption</p>
               <Badge variant="success">Enforced</Badge>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

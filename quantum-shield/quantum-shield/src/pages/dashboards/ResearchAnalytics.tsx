import React from 'react';
import { BookOpen, Award, FileSignature, GitBranch, Cpu, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function ResearchAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center">
            <Award className="w-6 h-6 mr-3 text-primary" />
            Research & Demonstration Mode
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl">
            A comprehensive overview of the cryptographic architecture, literature review, and original contributions for the B.Tech Final Year project evaluation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
              Base Research Papers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-surface rounded-lg border border-border">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Paper 1</p>
              <h4 className="font-bold text-text-main leading-tight">Secure Exam Paper Distribution System using Advanced Cryptography</h4>
              <p className="text-sm text-text-muted mt-2">Provides the foundational framework for Role-Based Access Control and symmetric payload encryption (AES-256) in an educational setting.</p>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Paper 2</p>
              <h4 className="font-bold text-text-main leading-tight">Post-Quantum Key Encapsulation and Digital Signatures (NIST PQC)</h4>
              <p className="text-sm text-text-muted mt-2">Explores the mathematical theory behind ML-KEM and ML-DSA, standardizing quantum-resistant algorithms against Shor's algorithm.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-500" />
              Our Original Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Hybrid Post-Quantum Architecture', desc: 'Successfully merging classical AES-256-GCM payload encryption with Post-Quantum key exchange and authentication.' },
              { title: 'Cryptographic Verification Timeline (CVT)', desc: 'A novel transparent visualization module exposing step-by-step cryptographic checks during payload retrieval.' },
              { title: 'Automated Tamper Detection Engine', desc: 'Real-time orchestration of SHA3 verification, Signature checks, and Key Decapsulation with automatic incident logging.' },
              { title: 'Enterprise Dashboard Visualization', desc: 'Live monitoring and benchmarking of microsecond algorithm execution speeds.' },
            ].map((contrib, i) => (
              <div key={i} className="flex items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-text-main">{contrib.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5">{contrib.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="w-5 h-5 mr-2" />
            Complete Cryptographic Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative p-6 bg-surface/30 rounded-xl border border-border overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 relative z-10">
              
              <div className="text-center w-full md:w-1/4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-blue-200">
                  <FileSignature className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm">1. SHA3-256 Hashing</h4>
                <p className="text-xs text-text-muted mt-1 px-4">Generates deterministic digest of plaintext</p>
              </div>

              <div className="hidden md:block w-8 border-t-2 border-dashed border-gray-300"></div>

              <div className="text-center w-full md:w-1/4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-green-200">
                  <GitBranch className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm">2. ML-DSA (Dilithium)</h4>
                <p className="text-xs text-text-muted mt-1 px-4">Digitally signs the SHA3 hash</p>
              </div>

              <div className="hidden md:block w-8 border-t-2 border-dashed border-gray-300"></div>

              <div className="text-center w-full md:w-1/4">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-purple-200">
                  <Cpu className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm">3. ML-KEM (Kyber)</h4>
                <p className="text-xs text-text-muted mt-1 px-4">Encapsulates AES symmetric key</p>
              </div>

              <div className="hidden md:block w-8 border-t-2 border-dashed border-gray-300"></div>

              <div className="text-center w-full md:w-1/4">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-orange-200">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm">4. AES-256-GCM</h4>
                <p className="text-xs text-text-muted mt-1 px-4">Encrypts PDF payload</p>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

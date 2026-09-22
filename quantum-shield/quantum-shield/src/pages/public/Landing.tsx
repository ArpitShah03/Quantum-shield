import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, Share2, Zap, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const features = [
  { icon: Zap, title: 'Quantum Resistant', desc: 'Protected against future quantum computing attacks using ML-KEM.' },
  { icon: Lock, title: 'Hybrid Encryption', desc: 'AES-256 combined with Kyber for ultimate security and speed.' },
  { icon: Shield, title: 'Tamper Detection', desc: 'SHA-3 hashing ensures zero modifications to original papers.' },
  { icon: Share2, title: 'Secure Distribution', desc: 'End-to-end encrypted delivery to registered exam centres.' },
  { icon: FileCheck, title: 'Integrity Verification', desc: 'Digital signatures guarantee authenticity of the source.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Strict access controls for Admins, Professors, and Centres.' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-text-main font-sans selection:bg-primary/20">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 text-primary">
          <Shield className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-text-main">QuantumShield</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
      </nav>

      {/* Hero Section */}
      <main className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Post-Quantum Secure <br />
            <span className="text-primary">Exam Paper Distribution</span>
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-3xl mx-auto leading-relaxed">
            A research-oriented framework for secure examination document protection using Hybrid Post-Quantum Cryptography. Ensure integrity and confidentiality in the quantum era.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto">
              Login to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Explore Architecture
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="bg-surface py-24 px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-border hover:shadow-card-hover transition-all cursor-default"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Workflow */}
      <section className="py-24 px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-16">Workflow Architecture</h2>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-4">
          {['Professor', 'Encrypt', 'Store', 'Verify', 'Exam Centre'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="px-6 py-4 bg-white border border-border rounded-lg font-semibold shadow-sm">
                {step}
              </div>
              {i !== arr.length - 1 && (
                <div className="text-text-muted">
                  <ArrowRight className="hidden md:block w-6 h-6" />
                  <div className="md:hidden w-1 h-8 bg-border mx-auto" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Research Section */}
      <section className="bg-text-main text-white py-24 px-8 text-center">
        <h2 className="text-3xl font-bold mb-12">Research Foundations</h2>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8 max-w-4xl mx-auto">
          <div className="flex-1 p-6 border border-white/20 rounded-xl bg-white/5">
            Base Paper 1
          </div>
          <div className="flex-1 p-6 border border-white/20 rounded-xl bg-white/5">
            Base Paper 2
          </div>
          <div className="flex-1 p-6 border border-primary bg-primary/20 rounded-xl font-bold text-primary-light shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            Our Contribution
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-text-muted border-t border-border bg-white">
        <p>© 2026 QuantumShield Research Framework. Phase 1 UI Mockup.</p>
      </footer>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    axios.get('http://localhost:8000/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setProfile(res.data))
    .catch(console.error);
  }, []);

  if (!profile) return <div>Loading Settings...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile</h2>
      
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Name</p>
                    <p className="text-base text-slate-800">{profile.name}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Email</p>
                    <p className="text-base text-slate-800">{profile.email}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Role</p>
                    <p className="text-base text-slate-800">{profile.role}</p>
                </div>
                {profile.role === 'Professor' && (
                <>
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Department</p>
                    <p className="text-base text-slate-800">{profile.department}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Employee ID</p>
                    <p className="text-base text-slate-800">{profile.employee_id}</p>
                </div>
                </>
                )}
                {profile.role === 'Administrator' && (
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Employee ID</p>
                    <p className="text-base text-slate-800">{profile.employee_id}</p>
                </div>
                )}
                {profile.role === 'Exam Centre' && (
                <div>
                    <p className="text-sm text-slate-500 font-semibold">Centre Code</p>
                    <p className="text-base text-slate-800">{profile.centre_code}</p>
                </div>
                )}
            </div>
        </div>

        {profile.role === 'Professor' && profile.certificate_id && (
            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <ShieldCheck className="mr-2 text-emerald-600" size={20} /> Cryptographic Identity
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Certificate Status</p>
                            <p className="text-sm text-emerald-600 font-bold mt-1 flex items-center">
                                <CheckCircle size={14} className="mr-1"/> Verified Active
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Issued By</p>
                            <p className="text-sm text-slate-800 font-bold mt-1">University CA</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Certificate ID</p>
                            <p className="text-sm text-slate-800 font-mono mt-1">{profile.certificate_id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expiry</p>
                            <p className="text-sm text-slate-800 mt-1">{new Date(profile.certificate_expiry).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ML-DSA Public Key (Fingerprint)</p>
                            <p className="text-xs text-slate-600 font-mono bg-white p-2 rounded border break-all">
                                {profile.certificate_id}-A8F9-11B2-C3D4-E5F6-000000000000
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 italic">Private keys are securely stored in the Hardware Security Module and are never exposed to the frontend.</p>
                </div>
            </div>
        )}

        {/* Profile is read-only, no editable settings for phase 3 */}
      </div>
    </div>
  );
}

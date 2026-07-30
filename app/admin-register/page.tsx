// app/register-admin-secure/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function AdminSecureRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        password: form.password,
        role: 'admin', // 🔒 Securely locked to administrative clearance boundaries
      };

      const res = await api.auth.register(payload);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      router.push('/dashboard/admin');
    } catch (err: any) {
      setError(err.message || 'Administrative clearance registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-3 text-purple-400 font-mono text-xl font-bold shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            Ω
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Admin Provisioning Terminal
          </h2>
          <p className="text-gray-400 text-xs mt-2">Secure node for lecturer and system administrator registration</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Staff Full Name</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 text-sm"
              placeholder="e.g. Dr. Adebayo Oladipo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Official Email Address</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 text-sm"
              placeholder="lecturer@university.edu.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Master Security Passphrase</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            {loading ? 'Authorizing Administrative Credentials...' : 'Provision Clearance Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
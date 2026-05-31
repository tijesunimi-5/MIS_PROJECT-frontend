// app/register/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    matric_no: '',
    department: '',
    current_level: '100'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        current_level: form.role === 'student' ? Number(form.current_level) : undefined,
        matric_no: form.role === 'student' ? form.matric_no : undefined,
        department: form.role === 'student' ? form.department : undefined,
      };

      const res = await api.auth.register(payload);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      if (res.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push(`/dashboard/student/${res.user.student_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4 py-12">
      <div className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Create Portal Account
          </h2>
          <p className="text-gray-400 text-sm mt-2">Register to access the management network</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Full Name</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500"
              placeholder="e.g. Samuel Tijesunimi"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500"
                placeholder="samuel@university.edu.ng"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Account Role type</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 text-gray-300"
            >
              <option value="student">Student Profile</option>
              <option value="admin">System Administrator / Lecturer</option>
            </select>
          </div>

          {form.role === 'student' && (
            <div className="p-4 bg-[#1F2937]/30 border border-gray-800 rounded-xl space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Academic Affiliation details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Matric Number</label>
                  <input
                    type="text" required
                    value={form.matric_no}
                    onChange={e => setForm({ ...form, matric_no: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    placeholder="202100123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Department</label>
                  <input
                    type="text" required
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-white"
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Current Level</label>
                <select
                  value={form.current_level}
                  onChange={e => setForm({ ...form, current_level: e.target.value })}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-gray-300"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Initializing Core Profile...' : 'Complete System Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
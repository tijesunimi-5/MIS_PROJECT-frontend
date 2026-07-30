// app/dashboard/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Course, StudentRosterItem } from '../../../types/index';
import { cryptoUtils } from '../../../lib/crypto';

export default function UnifiedAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scores' | 'courses'>('scores');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentRosterItem[]>([]);

  // Lecturer Decryption Vault States
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultKey, setVaultKey] = useState('');
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [inputVaultKey, setInputVaultKey] = useState('');
  const [vaultError, setVaultError] = useState('');

  // Score form states
  const [scoreForm, setScoreForm] = useState({
    student_id: '',
    course_id: '',
    ca_score: '',
    exam_score: '',
    semester: 'First',
    academic_year: '2025/2026',
  });

  // Course management states
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_title: '',
    unit_counts: '3',
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Synchronize dropdown metadata lists from backend
  const syncDashboardData = async () => {
    try {
      const [coursesData, studentsData] = await Promise.all([
        api.courses.getAll(),
        api.students.getRoster()
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Error synchronizing admin metadata catalog:', err);
    }
  };

  useEffect(() => {
    syncDashboardData();
  }, []);

  // Unlock Lecturer Vault
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError('');

    if (!inputVaultKey.trim()) {
      setVaultError('Please enter an encryption key.');
      return;
    }

    const testCiphertext = students[0]?.enc_name || courses[0]?.enc_course_code || '';
    
    if (testCiphertext && !cryptoUtils.verifyKey(testCiphertext, inputVaultKey.trim())) {
      setVaultError('Invalid encryption key. Decryption failed.');
      return;
    }

    setVaultKey(inputVaultKey.trim());
    setIsVaultUnlocked(true);
    setShowVaultModal(false);
    setInputVaultKey('');
  };

  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setVaultKey('');
  };

  // Helper to format student label (Decrypted vs Ciphertext)
  const renderStudentLabel = (s: StudentRosterItem) => {
    if (isVaultUnlocked) {
      const name = s.enc_name ? cryptoUtils.decryptPayload(s.enc_name, vaultKey) : s.name;
      const matric = s.enc_matric_no ? cryptoUtils.decryptPayload(s.enc_matric_no, vaultKey) : s.matric_no;
      return `${name} — [${matric}]`;
    }
    return `${s.enc_name || s.name} — [${s.enc_matric_no || s.matric_no}]`;
  };

  // Helper to format course label (Decrypted vs Ciphertext)
  const renderCourseLabel = (c: Course) => {
    if (isVaultUnlocked) {
      const code = c.enc_course_code ? cryptoUtils.decryptPayload(c.enc_course_code, vaultKey) : c.course_code;
      const title = c.enc_course_title ? cryptoUtils.decryptPayload(c.enc_course_title, vaultKey) : c.course_title;
      return `${code} — ${title}`;
    }
    return `${c.enc_course_code || c.course_code} — ${c.enc_course_title || c.course_title}`;
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await api.results.uploadScore({
        student_id: Number(scoreForm.student_id),
        course_id: Number(scoreForm.course_id),
        ca_score: Number(scoreForm.ca_score),
        exam_score: Number(scoreForm.exam_score),
        semester: scoreForm.semester,
        academic_year: scoreForm.academic_year,
      });
      setMsg({ type: 'success', text: 'Academic result points committed to database successfully.' });
      setScoreForm(prev => ({ ...prev, student_id: '', ca_score: '', exam_score: '' }));
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error processing score submission.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await api.courses.create({
        course_code: courseForm.course_code.toUpperCase(),
        course_title: courseForm.course_title,
        unit_counts: Number(courseForm.unit_counts),
      });
      setMsg({ type: 'success', text: `New course metric ${courseForm.course_code.toUpperCase()} initialized into catalog index.` });
      setCourseForm({ course_code: '', course_title: '', unit_counts: '3' });
      await syncDashboardData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error creating course.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans pb-12">
      {/* NAVBAR LAYER */}
      <nav className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
            <h1 className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Lecturer & Admin Terminal
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-red-950/30 hover:border-red-900 hover:text-red-400 transition-all cursor-pointer"
          >
            Revoke Access Session
          </button>
        </div>
      </nav>

      {/* WORKSPACE AREA */}
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* LECTURER DECRYPTION VAULT BANNER */}
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-all ${
          isVaultUnlocked 
            ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300' 
            : 'bg-purple-950/30 border-purple-800/80 text-purple-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              isVaultUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              {isVaultUnlocked ? '🔓' : '🔒'}
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {isVaultUnlocked ? 'Lecturer Vault Unlocked (Plain Text View Active)' : 'Encrypted Storage Mode (Ciphertexts Displayed)'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isVaultUnlocked 
                  ? 'All student profiles and course records are decrypted locally using your key.' 
                  : 'Data is protected. Enter your encryption key to view decrypted records.'}
              </p>
            </div>
          </div>

          {isVaultUnlocked ? (
            <button
              onClick={handleLockVault}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl border border-gray-700 transition-all cursor-pointer whitespace-nowrap"
            >
              🔒 Lock Vault View
            </button>
          ) : (
            <button
              onClick={() => setShowVaultModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              🔓 Enter Key to Decrypt Data
            </button>
          )}
        </div>

        {/* TAB CONTROLS SELECTOR */}
        <div className="flex bg-[#111827] border border-gray-800 p-1.5 rounded-2xl max-w-sm">
          <button
            onClick={() => { setActiveTab('scores'); setMsg({ type: '', text: '' }); }}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'scores' ? 'bg-[#1F2937] text-purple-400 shadow-md border border-gray-700' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Compute Results Engine
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setMsg({ type: '', text: '' }); }}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'courses' ? 'bg-[#1F2937] text-purple-400 shadow-md border border-gray-700' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Course Allocation Registry
          </button>
        </div>

        {/* NOTIFICATION LAYER */}
        {msg.text && (
          <div className={`p-4 rounded-xl border text-xs font-medium tracking-wide animate-fadeIn ${
            msg.type === 'success' ? 'bg-green-950/30 border-green-800/60 text-green-400' : 'bg-red-950/30 border-red-800/60 text-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        {/* TAB 1 CONTENT PANEL: GRADE PROCESSING ENGINE */}
        {activeTab === 'scores' && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Result Calculation Matrix</h2>
              <p className="text-gray-400 text-xs mt-1">Append Continuous Assessments and examination values directly to PostgreSQL relational tables.</p>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* STUDENT SELECTION DROPDOWN */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Select Target Student {isVaultUnlocked ? '🔓' : '🔒 (Encrypted)'}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={scoreForm.student_id}
                      onChange={e => setScoreForm({ ...scoreForm, student_id: e.target.value })}
                      className="w-full bg-[#1F2937] hover:bg-[#28354b] border border-gray-700 text-white font-medium text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer appearance-auto font-mono"
                    >
                      <option value="" className="text-gray-400 bg-[#111827]">
                        Choose student roster profile...
                      </option>
                      {students.map(s => (
                        <option
                          key={s.student_id}
                          value={s.student_id}
                          className="text-gray-200 bg-[#111827] py-3 my-1 block"
                        >
                          {renderStudentLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* COURSE ALLOCATION DROPDOWN */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Academic Course Allocation {isVaultUnlocked ? '🔓' : '🔒 (Encrypted)'}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={scoreForm.course_id}
                      onChange={e => setScoreForm({ ...scoreForm, course_id: e.target.value })}
                      className="w-full bg-[#1F2937] hover:bg-[#28354b] border border-gray-700 text-white font-medium text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer appearance-auto font-mono"
                    >
                      <option value="" className="text-gray-400 bg-[#111827]">
                        Select validated course...
                      </option>
                      {courses.map(c => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="text-gray-200 bg-[#111827] py-3 block"
                        >
                          {renderCourseLabel(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Session Year Code</label>
                  <input
                    type="text" required
                    value={scoreForm.academic_year}
                    onChange={e => setScoreForm({ ...scoreForm, academic_year: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 text-sm text-white"
                    placeholder="2025/2026"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Semester</label>
                  <select
                    value={scoreForm.semester}
                    onChange={e => setScoreForm({ ...scoreForm, semester: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 text-sm text-gray-300 appearance-auto"
                  >
                    <option value="First" className="bg-[#111827]">First / Harmattan Semester</option>
                    <option value="Second" className="bg-[#111827]">Second / Rain Semester</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">CA Grade Vol (Max 30)</label>
                  <input
                    type="number" step="0.01" min="0" max="30" required
                    value={scoreForm.ca_score}
                    onChange={e => setScoreForm({ ...scoreForm, ca_score: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 font-mono text-amber-400 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Examination Score (Max 70)</label>
                  <input
                    type="number" step="0.01" min="0" max="70" required
                    value={scoreForm.exam_score}
                    onChange={e => setScoreForm({ ...scoreForm, exam_score: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3.5 focus:outline-none focus:border-purple-500 font-mono text-indigo-400 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                {submitting ? 'Updating Database Matrices...' : 'Push and Calculate Grades'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2 CONTENT PANEL: COURSE REGISTRY */}
        {activeTab === 'courses' && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Academic Course Catalog Provisioning</h2>
              <p className="text-gray-400 text-xs mt-1">Register verified curriculum items into your relational database structure schema.</p>
            </div>

            <form onSubmit={handleCourseSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Code Identifier</label>
                  <input
                    type="text" required maxLength={10}
                    value={courseForm.course_code}
                    onChange={e => setCourseForm({ ...courseForm, course_code: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-purple-500 text-purple-400"
                    placeholder="CSC401"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Full Course Nomenclature Title</label>
                  <input
                    type="text" required
                    value={courseForm.course_title}
                    onChange={e => setCourseForm({ ...courseForm, course_title: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 text-white"
                    placeholder="Advanced Relational Systems Engineering"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Credit Unit Value Weights</label>
                <select
                  value={courseForm.unit_counts}
                  onChange={e => setCourseForm({ ...courseForm, unit_counts: e.target.value })}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 appearance-auto"
                >
                  <option value="1" className="bg-[#111827]">1 Unit Weight</option>
                  <option value="2" className="bg-[#111827]">2 Unit Weight</option>
                  <option value="3" className="bg-[#111827]">3 Unit Weight</option>
                  <option value="4" className="bg-[#111827]">4 Unit Weight</option>
                  <option value="5" className="bg-[#111827]">5 Unit Weight</option>
                </select>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer"
              >
                {submitting ? 'Registering Catalog Parameters...' : 'Inject Into Catalog Schema'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* LECTURER ENCRYPTION KEY MODAL */}
      {showVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h3 className="font-bold text-white text-base">Lecturer Encryption Key</h3>
              </div>
              <button
                onClick={() => setShowVaultModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Enter your Master Secret Encryption Key to decrypt student identity profiles and course records on your screen.
            </p>

            {vaultError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs">
                {vaultError}
              </div>
            )}

            <form onSubmit={handleUnlockVault} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Master Key Passphrase</label>
                <input
                  type="password"
                  required
                  value={inputVaultKey}
                  onChange={e => setInputVaultKey(e.target.value)}
                  placeholder="12345678901234567890123456789012"
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVaultModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg transition-all"
                >
                  Decrypt Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Course } from '../../../types/index';

export default function UnifiedAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scores' | 'courses'>('scores');
  const [courses, setCourses] = useState<Course[]>([]);

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

  // Load latest course catalogs on assembly hook execution
  const syncCourseCatalog = async () => {
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (err) {
      console.error('Error synchronizing academic records catalog:', err);
    }
  };

  useEffect(() => {
    syncCourseCatalog();
  }, []);

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
      setMsg({ type: 'success', text: 'Academic result points committed to Postgres database pool successfully.' });
      setScoreForm(prev => ({ ...prev, student_id: '', ca_score: '', exam_score: '' }));
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error processing structural write execution boundaries.' });
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
      await syncCourseCatalog(); // Refresh list dropdown metrics live
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error injecting course paper allocation parameters.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      {/* NAVBAR LAYER */}
      <nav className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
            <h1 className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Admin Terminal Console
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-red-950/30 hover:border-red-900 hover:text-red-400 transition-all"
          >
            Revoke Access Session
          </button>
        </div>
      </nav>

      {/* WORKSPACE AREA */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* TAB CONTROLS SELECTOR */}
        <div className="flex bg-[#111827] border border-gray-800 p-1.5 rounded-2xl max-w-sm">
          <button
            onClick={() => { setActiveTab('scores'); setMsg({ type: '', text: '' }); }}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'scores' ? 'bg-[#1F2937] text-purple-400 shadow-md border border-gray-700' : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Compute Results Engine
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setMsg({ type: '', text: '' }); }}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'courses' ? 'bg-[#1F2937] text-purple-400 shadow-md border border-gray-700' : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Course Allocation Registry
          </button>
        </div>

        {/* NOTIFICATION LAYER */}
        {msg.text && (
          <div className={`p-4 rounded-xl border text-xs font-medium tracking-wide animate-fadeIn ${msg.type === 'success' ? 'bg-green-950/30 border-green-800/60 text-green-400' : 'bg-red-950/30 border-red-800/60 text-red-400'
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
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Student Relational ID</label>
                  <input
                    type="number" required min="1"
                    value={scoreForm.student_id}
                    onChange={e => setScoreForm({ ...scoreForm, student_id: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-sm"
                    placeholder="e.g. 1"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Academic Course Allocation</label>
                  <select
                    required
                    value={scoreForm.course_id}
                    onChange={e => setScoreForm({ ...scoreForm, course_id: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-sm text-gray-300"
                  >
                    <option value="">Select validated course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.course_code} — {c.course_title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Session Year Code</label>
                  <input
                    type="text" required
                    value={scoreForm.academic_year}
                    onChange={e => setScoreForm({ ...scoreForm, academic_year: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                    placeholder="2025/2026"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Semester</label>
                  <select
                    value={scoreForm.semester}
                    onChange={e => setScoreForm({ ...scoreForm, semester: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-sm text-gray-300"
                  >
                    <option value="First">First / Harmattan Semester</option>
                    <option value="Second">Second / Rain Semester</option>
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
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-amber-400 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Examination Score (Max 70)</label>
                  <input
                    type="number" step="0.01" min="0" max="70" required
                    value={scoreForm.exam_score}
                    onChange={e => setScoreForm({ ...scoreForm, exam_score: e.target.value })}
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-indigo-400 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-40"
              >
                {submitting ? 'Updating Database Matrices...' : 'Push and Calculate Grades'}
              </button>
            </form>
          </div>
        )}

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
                    className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Advanced Relational Systems Engineering"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Credit Unit Value Weights</label>
                <select
                  value={courseForm.unit_counts}
                  onChange={e => setCourseForm({ ...courseForm, unit_counts: e.target.value })}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="1">1 Unit Weight</option>
                  <option value="2">2 Unit Weight</option>
                  <option value="3">3 Unit Weight</option>
                  <option value="4">4 Unit Weight</option>
                  <option value="5">5 Unit Weight</option>
                </select>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40"
              >
                {submitting ? 'Registering Catalog Parameters...' : 'Inject Into Catalog Schema'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
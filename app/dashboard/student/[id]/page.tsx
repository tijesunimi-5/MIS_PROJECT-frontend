'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { ReportCardResponse } from '../../../../types/index';

export default function StudentDashboardPortal() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentMetricsMatrix = async () => {
      try {
        // Axios/Fetch abstraction tracking Postgres dynamic inner analytical joins
        const data = await api.results.getReportCard(Number(id));
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to pull academic performance records.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentMetricsMatrix();
    }
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-gray-400 font-medium">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm tracking-wide">Compiling academic history matrix...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] border border-red-900/40 p-6 rounded-2xl text-center space-y-4">
          <p className="text-red-400 font-medium text-sm">{error || 'Academic record schema mismatch.'}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300 hover:bg-gray-700"
          >
            Return to Portal Gate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans pb-16">
      {/* BRANDING NAVBAR */}
      <nav className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            <h1 className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Student Information Portal
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-red-950/30 hover:border-red-900 hover:text-red-400 transition-all"
          >
            Logout Session
          </button>
        </div>
      </nav>

      {/* CORE FRAMEWORK CONTAINER */}
      <main className="max-w-5xl mx-auto px-6 mt-12 space-y-8">

        {/* TOP LEVEL CGPA SCOREBOARD METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Academic Reference</span>
            <span className="text-2xl font-mono font-bold tracking-tight mt-2 text-white">#STU-{report.student_id}</span>
          </div>

          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Enrollment Standing</span>
            <span className="text-xl font-bold text-emerald-400 tracking-tight mt-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Active Good Standing
            </span>
          </div>

          <div className="bg-[#111827] border border-indigo-950 p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#141233] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider relative z-10">Calculated Overall CGPA</span>
            <span className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 mt-2 relative z-10 font-mono">
              {report.cgpa}
            </span>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
          </div>
        </div>

        {/* SEMESTER RECORD CARDS TIMELINE */}
        <div className="pt-6 space-y-8">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-lg font-bold tracking-tight text-gray-300">Term Performance Transcripts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dynamically evaluated quality points distributed per session.</p>
          </div>

          {Object.keys(report.academic_records).length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-sm font-medium">
              No performance matrices uploaded to this schema profile layer yet.
            </div>
          ) : (
            Object.entries(report.academic_records).map(([semesterKey, termSummary]) => (
              <div key={semesterKey} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-md space-y-5">

                {/* HEADER ELEMENT COMPILING TERM PARAMS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-4 gap-3">
                  <h4 className="text-base font-bold text-indigo-300 tracking-tight">{semesterKey}</h4>
                  <div className="flex gap-4 text-xs font-medium bg-[#1F2937]/40 px-4 py-2 rounded-xl border border-gray-800">
                    <div className="text-gray-400">Total Units: <span className="text-white font-semibold">{termSummary.totalUnits}</span></div>
                    <div className="border-l border-gray-700 pl-4 text-gray-400">
                      Term GPA: <span className="text-amber-400 font-bold font-mono">{termSummary.gpa}</span>
                    </div>
                  </div>
                </div>

                {/* RELATIONAL DATA MATRIX TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-3 px-4 pl-2">Course Code</th>
                        <th className="py-3 px-4">Course Nomenclature Title</th>
                        <th className="py-3 px-4 text-center">Units</th>
                        <th className="py-3 px-4 text-center">CA (30)</th>
                        <th className="py-3 px-4 text-center">Exam (70)</th>
                        <th className="py-3 px-4 text-center">Aggregate</th>
                        <th className="py-3 px-4 text-center pr-2">Letter Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {termSummary.courses.map((course) => (
                        <tr key={course.id} className="hover:bg-[#1F2937]/10 transition-colors group">
                          <td className="py-3.5 px-4 pl-2 font-mono font-bold text-purple-400 text-xs">{course.course_code}</td>
                          <td className="py-3.5 px-4 text-gray-300 font-medium tracking-wide group-hover:text-white transition-colors">{course.course_title}</td>
                          <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{course.unit_counts}</td>
                          <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{course.ca_score}</td>
                          <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{course.exam_score}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-white font-mono">{course.total_score}</td>
                          <td className="py-3.5 px-4 text-center pr-2">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block font-mono ${course.letter_grade === 'A' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' :
                                course.letter_grade === 'B' ? 'bg-blue-950/50 text-blue-400 border border-blue-800/40' :
                                  course.letter_grade === 'C' ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/40' :
                                    course.letter_grade === 'F' ? 'bg-red-950/50 text-red-400 border border-red-800/40 animate-pulse' :
                                      'bg-gray-800/60 text-gray-300'
                              }`}>
                              {course.letter_grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
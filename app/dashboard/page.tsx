'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRouteHub() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      // Missing credentials boundary -> send back to entry gate
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'student' && user.student_id) {
        router.push(`/dashboard/student/${user.student_id}`);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Context parsing corruption error:', error);
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-gray-400 font-medium">
      <div className="text-center space-y-3">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm tracking-wide">Resolving security context metrics...</p>
      </div>
    </div>
  );
}
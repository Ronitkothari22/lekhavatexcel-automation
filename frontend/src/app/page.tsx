'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center p-10 bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Healthcare Quality Management System
        </h1>
        <p className="text-lg text-gray-700 mb-10 font-medium">
          Excel Automation System for Quality Indicators
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full bg-white text-blue-600 py-4 px-6 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-semibold text-lg shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

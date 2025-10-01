'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  FileText,
  LogOut,
  User,
  Database,
  Edit3,
  BarChart3,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const pages = [
    {
      name: 'Viroc Mapping Reference',
      description: 'View all Viroc mappings and quality indicators',
      icon: Database,
      href: '/viroc-mappings',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Data Entry Form',
      description: 'Submit new quality indicator data',
      icon: Edit3,
      href: '/data-entry',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'My Submissions',
      description: 'View and manage your submitted forms',
      icon: FileText,
      href: '/my-submissions',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Statistics',
      description: 'Download and analyze data with Excel export',
      icon: BarChart3,
      href: '/statistics',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-lg text-gray-600">
            Choose an option below to get started
          </p>
        </div>

        {/* Page Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pages.map((page) => (
            <button
              key={page.name}
              onClick={() => router.push(page.href)}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all text-left group"
            >
              <div className={`${page.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition group-hover:scale-110`}>
                <page.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {page.name}
              </h3>
              <p className="text-gray-600">{page.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, UserCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { setUserRole } = useAppStore();

  const handleRoleSelect = (role: 'admin' | 'applicant') => {
    setUserRole(role);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/jobs');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-5xl font-bold tracking-tight text-transparent">
            HireHub
          </h1>
          <p className="text-lg text-slate-400">
            Modern hiring management for modern teams
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          {/* Admin Card */}
          <Card
            className="group cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
            onClick={() => handleRoleSelect('admin')}
          >
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform group-hover:scale-110">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Recruiter / Admin</CardTitle>
              <CardDescription className="text-slate-400">
                Manage job postings and review candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-4 space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Create and manage job listings
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Configure application forms
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Review and filter candidates
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                Continue as Admin
              </Button>
            </CardContent>
          </Card>

          {/* Applicant Card */}
          <Card
            className="group cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
            onClick={() => handleRoleSelect('applicant')}
          >
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Job Seeker</CardTitle>
              <CardDescription className="text-slate-400">
                Browse jobs and submit applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-4 space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Browse active job openings
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Submit tailored applications
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Track application status
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Continue as Applicant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-slate-500">
          Demo application • No real data is stored
        </p>
      </div>
    </div>
  );
}

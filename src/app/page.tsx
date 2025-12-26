'use client';

import Link from 'next/link';
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
    <div className="min-h-screen bg-[#1D1F20]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFB400]/5 via-transparent to-[#FFB400]/5" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Logo & Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            {/* Rakamin-style Logo Placeholder */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFB400] shadow-lg shadow-[#FFB400]/20">
              <Briefcase className="h-10 w-10 text-[#1D1F20]" />
            </div>
          </div>
          <h1 className="mb-3 font-heading text-5xl font-bold tracking-tight text-white">
            HireHub
          </h1>
          <p className="text-lg text-gray-400">
            Modern hiring management platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
          {/* Admin Card */}
          <Card
            className="group cursor-pointer border-gray-700 bg-[#2A2D2F] transition-all duration-300 hover:border-[#FFB400]/50 hover:shadow-lg hover:shadow-[#FFB400]/10"
            onClick={() => handleRoleSelect('admin')}
          >
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFB400] shadow-lg transition-transform group-hover:scale-105">
                <Users className="h-7 w-7 text-[#1D1F20]" />
              </div>
              <CardTitle className="font-heading text-xl text-white">Recruiter / Admin</CardTitle>
              <CardDescription className="text-gray-400">
                Manage job postings and review candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-5 space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]" />
                  Create and manage job listings
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]" />
                  Configure application forms
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]" />
                  Review and filter candidates
                </li>
              </ul>
              <Button className="w-full bg-[#FFB400] text-[#1D1F20] font-semibold hover:bg-[#E5A300] transition-colors">
                Masuk sebagai Admin
              </Button>
            </CardContent>
          </Card>

          {/* Applicant Card */}
          <Card
            className="group cursor-pointer border-gray-700 bg-[#2A2D2F] transition-all duration-300 hover:border-[#FFB400]/50 hover:shadow-lg hover:shadow-[#FFB400]/10"
            onClick={() => handleRoleSelect('applicant')}
          >
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-600 shadow-lg transition-transform group-hover:scale-105 group-hover:bg-[#FFB400]">
                <UserCircle className="h-7 w-7 text-white group-hover:text-[#1D1F20]" />
              </div>
              <CardTitle className="font-heading text-xl text-white">Job Seeker</CardTitle>
              <CardDescription className="text-gray-400">
                Browse jobs and submit applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-5 space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 group-hover:bg-[#FFB400]" />
                  Browse active job openings
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 group-hover:bg-[#FFB400]" />
                  Submit tailored applications
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 group-hover:bg-[#FFB400]" />
                  Track application status
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-[#FFB400] hover:text-[#1D1F20] hover:border-[#FFB400] transition-colors">
                Masuk sebagai Applicant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Login Link */}
        <div className="mt-12 text-center">
          <Link href="/login" className="text-sm text-[#FFB400] hover:underline">
            Sudah punya akun? Masuk di sini
          </Link>
          <p className="mt-2 text-xs text-gray-600">
            Demo application • Rakamin Academy Challenge
          </p>
        </div>
      </div>
    </div>
  );
}

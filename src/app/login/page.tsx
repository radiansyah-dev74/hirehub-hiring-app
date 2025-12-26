'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { setUserRole } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate login - in real app this would call Supabase Auth
        await new Promise(resolve => setTimeout(resolve, 500));

        // Demo: check for admin or applicant based on email
        if (email.includes('admin')) {
            setUserRole('admin');
            router.push('/admin');
        } else if (email && password) {
            setUserRole('applicant');
            router.push('/jobs');
        } else {
            setError('Please enter valid credentials');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="text-center pb-2">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFB400]">
                                <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="font-heading text-xl font-bold text-[#1D1F20]">
                                    HireHub
                                </h1>
                                <p className="text-xs text-gray-500">Hiring Platform</p>
                            </div>
                        </div>
                    </div>
                    <h2 className="font-heading text-lg font-semibold text-[#1D1F20]">
                        Masuk ke HireHub
                    </h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm text-gray-600">
                                Alamat email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukan email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400]"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm text-gray-600">
                                Kata sandi
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukan kata sandi"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400] pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}

                        {/* Submit Button - Yellow like Figma */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFB400] hover:bg-[#E5A300] text-white font-semibold py-2.5"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </Button>

                        {/* Demo hint */}
                        <p className="text-xs text-center text-gray-400 mt-4">
                            Demo: Use any email with &quot;admin&quot; for admin access, or any email for applicant access
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

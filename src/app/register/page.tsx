'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { setUserRole } = useAppStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [authError, setAuthError] = useState('');

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        if (!validate()) return;

        setIsLoading(true);

        try {
            const { user, error } = await authService.signUp(email, password, name);

            if (error) {
                setAuthError(error.message);
                setIsLoading(false);
                return;
            }

            if (user) {
                setUserRole(user.role);
                router.push('/jobs');
            }
        } catch (err) {
            setAuthError('An unexpected error occurred');
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
                        Buat Akun Baru
                    </h2>
                    <p className="text-sm text-gray-500">Daftar untuk melamar pekerjaan</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm text-gray-600">
                                Nama Lengkap
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Masukan nama lengkap"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400] ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm text-gray-600">
                                Alamat Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukan email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400] ${errors.email ? 'border-red-500' : ''}`}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm text-gray-600">
                                Kata Sandi
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukan kata sandi (min. 6 karakter)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400] pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm text-gray-600">
                                Konfirmasi Kata Sandi
                            </Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukan ulang kata sandi"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`border-gray-300 focus:border-[#FFB400] focus:ring-[#FFB400] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button - Yellow like Figma */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFB400] hover:bg-[#E5A300] text-white font-semibold py-2.5"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Mendaftar...
                                </>
                            ) : (
                                'Daftar'
                            )}
                        </Button>

                        {/* Login link */}
                        <p className="text-sm text-center text-gray-600 mt-4">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-[#FFB400] hover:underline font-medium">
                                Masuk di sini
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

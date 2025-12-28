'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Edit,
    Save,
    X,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface UserProfile {
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { userRole, applications, jobs, fetchApplications, fetchJobs } = useAppStore();

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        // Load profile from localStorage (mock)
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('hirehub_user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    setProfile({
                        name: parsed.name || 'User',
                        email: parsed.email || 'user@example.com',
                        phone: parsed.phone || '',
                        createdAt: parsed.createdAt || new Date().toISOString(),
                    });
                } catch {
                    setProfile({
                        name: 'User',
                        email: 'user@example.com',
                    });
                }
            } else {
                // Default demo user
                setProfile({
                    name: userRole === 'admin' ? 'Admin User' : 'Applicant User',
                    email: userRole === 'admin' ? 'admin@hirehub.com' : 'applicant@example.com',
                });
            }
        }

        fetchApplications();
        fetchJobs();
    }, [userRole, fetchApplications, fetchJobs]);

    const handleSave = () => {
        // Save to localStorage (mock)
        localStorage.setItem('hirehub_user', JSON.stringify({
            ...profile,
            role: userRole,
        }));
        setIsEditing(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const myApplications = applications.filter(app => {
        // In real app, filter by user ID
        return true; // Show all for demo
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'hired':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-500/10 text-blue-500';
            case 'interview':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'hired':
                return 'bg-green-500/10 text-green-500';
            case 'rejected':
                return 'bg-red-500/10 text-red-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Profile</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your account settings
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-2xl bg-[#FFB400] text-white">
                                    {getInitials(profile.name)}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle>{profile.name}</CardTitle>
                            <CardDescription>{profile.email}</CardDescription>
                            <Badge variant="secondary" className="mt-2 capitalize">
                                {userRole}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Joined {profile.createdAt ? formatDate(profile.createdAt) : 'Recently'}</span>
                            </div>
                            {userRole === 'applicant' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{myApplications.length} applications</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Tabs defaultValue="info">
                            <TabsList>
                                <TabsTrigger value="info">
                                    <User className="h-4 w-4 mr-2" />
                                    Info
                                </TabsTrigger>
                                {userRole === 'applicant' && (
                                    <TabsTrigger value="applications">
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Applications
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="info" className="mt-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Personal Information</CardTitle>
                                            <CardDescription>
                                                Update your profile details
                                            </CardDescription>
                                        </div>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={handleSave}>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    <User className="h-4 w-4 inline mr-2" />
                                                    Full Name
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="name"
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-sm py-2">{profile.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    <Mail className="h-4 w-4 inline mr-2" />
                                                    Email
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={profile.email}
                                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-sm py-2">{profile.email}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    <Phone className="h-4 w-4 inline mr-2" />
                                                    Phone
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="phone"
                                                        value={profile.phone}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        placeholder="Enter phone number"
                                                    />
                                                ) : (
                                                    <p className="text-sm py-2">{profile.phone || 'Not specified'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {userRole === 'applicant' && (
                                <TabsContent value="applications" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>My Applications</CardTitle>
                                            <CardDescription>
                                                Track your job applications
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {myApplications.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>No applications yet</p>
                                                    <Button variant="link" onClick={() => router.push('/jobs')}>
                                                        Browse Jobs
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {myApplications.slice(0, 5).map((app) => {
                                                        const job = jobs.find(j => j.id === app.job_id);
                                                        return (
                                                            <div
                                                                key={app.id}
                                                                className="flex items-center justify-between p-4 border rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {getStatusIcon(app.status)}
                                                                    <div>
                                                                        <p className="font-medium">{job?.title || 'Unknown Job'}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Applied {formatDate(app.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge className={getStatusColor(app.status)} variant="secondary">
                                                                    {app.status}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

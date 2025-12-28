import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'applicant';
}

export interface AuthError {
    message: string;
    code?: string;
}

// Auth service for Supabase authentication
export const authService = {
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        if (!isSupabaseConfigured || !supabase) {
            // Mock signup for demo
            const mockUser: AuthUser = {
                id: crypto.randomUUID(),
                email,
                name,
                role: 'applicant',
            };
            localStorage.setItem('hirehub_user', JSON.stringify(mockUser));
            return { user: mockUser, error: null };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'applicant',
                },
            },
        });

        console.log('[SignUp] Response:', { data, error });

        if (error) {
            console.error('[SignUp] Error:', error);
            return { user: null, error: { message: error.message, code: error.code } };
        }

        if (data.user) {
            console.log('[SignUp] User created:', data.user.email);
            const user: AuthUser = {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name,
                role: data.user.user_metadata?.role || 'applicant',
            };
            return { user, error: null };
        }

        return { user: null, error: { message: 'Failed to create user' } };
    },

    /**
     * Sign in existing user
     */
    async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        if (!isSupabaseConfigured || !supabase) {
            // Mock login for demo
            const isAdmin = email.toLowerCase().includes('admin');
            const mockUser: AuthUser = {
                id: crypto.randomUUID(),
                email,
                name: isAdmin ? 'Admin User' : 'Applicant User',
                role: isAdmin ? 'admin' : 'applicant',
            };
            localStorage.setItem('hirehub_user', JSON.stringify(mockUser));
            return { user: mockUser, error: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { user: null, error: { message: error.message, code: error.code } };
        }

        if (data.user) {
            const user: AuthUser = {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name,
                role: data.user.user_metadata?.role || 'applicant',
            };
            return { user, error: null };
        }

        return { user: null, error: { message: 'Failed to sign in' } };
    },

    /**
     * Sign out current user
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        if (!isSupabaseConfigured || !supabase) {
            localStorage.removeItem('hirehub_user');
            return { error: null };
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            return { error: { message: error.message, code: error.code } };
        }
        localStorage.removeItem('hirehub_user');
        return { error: null };
    },

    /**
     * Get current user session
     */
    async getSession(): Promise<{ user: AuthUser | null; isLoading: boolean }> {
        if (!isSupabaseConfigured || !supabase) {
            // Check localStorage for mock user
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('hirehub_user');
                if (stored) {
                    try {
                        return { user: JSON.parse(stored), isLoading: false };
                    } catch {
                        return { user: null, isLoading: false };
                    }
                }
            }
            return { user: null, isLoading: false };
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            const user: AuthUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name,
                role: session.user.user_metadata?.role || 'applicant',
            };
            return { user, isLoading: false };
        }

        return { user: null, isLoading: false };
    },

    /**
     * Update user role (admin only)
     */
    async updateUserRole(userId: string, role: 'admin' | 'applicant'): Promise<{ error: AuthError | null }> {
        if (!isSupabaseConfigured || !supabase) {
            return { error: { message: 'Supabase not configured' } };
        }

        const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role },
        });

        if (error) {
            return { error: { message: error.message, code: error.code } };
        }
        return { error: null };
    },

    /**
     * Reset password
     */
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        if (!isSupabaseConfigured || !supabase) {
            return { error: { message: 'Password reset not available in demo mode' } };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            return { error: { message: error.message, code: error.code } };
        }
        return { error: null };
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
        if (!isSupabaseConfigured || !supabase) {
            // No-op for demo mode
            return () => { };
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    callback({
                        id: session.user.id,
                        email: session.user.email!,
                        name: session.user.user_metadata?.name,
                        role: session.user.user_metadata?.role || 'applicant',
                    });
                } else {
                    callback(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    },
};

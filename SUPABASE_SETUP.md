# 🚀 Supabase Setup Guide for HireHub

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (or use existing)
4. Create a new project with:
   - Name: `hirehub`
   - Database Password: (save this securely!)
   - Region: Choose closest to your users

## Step 2: Get API Keys

After project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Create .env.local

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Schema

1. Go to **SQL Editor** in Supabase
2. Run the contents of `supabase/schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    salary_range TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job form configs table
CREATE TABLE public.job_form_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    requirement TEXT NOT NULL CHECK (requirement IN ('mandatory', 'optional', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'hired', 'rejected')),
    form_data JSONB DEFAULT '{}',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(job_id, email)
);

-- Create indexes
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_email ON public.applications(email);
CREATE INDEX idx_job_form_configs_job_id ON public.job_form_configs(job_id);
```

## Step 5: Setup Authentication

1. Go to **Authentication** → **Providers**
2. Email provider is enabled by default
3. Optional: Enable social providers (Google, GitHub, etc.)

## Step 6: Setup Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_form_configs ENABLE ROW LEVEL SECURITY;

-- Jobs: Public read for active, admin write
CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage jobs" ON public.jobs
    FOR ALL USING (
        auth.jwt()->>'role' = 'admin'
    );

-- Applications: Users can view own applications, admins can view all
CREATE POLICY "Users can view own applications" ON public.applications
    FOR SELECT USING (
        email = auth.jwt()->>'email' OR
        auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY "Users can create applications" ON public.applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage applications" ON public.applications
    FOR ALL USING (
        auth.jwt()->>'role' = 'admin'
    );
```

## Step 7: Create Storage Bucket

1. Go to **Storage**
2. Create new bucket: `photos`
3. Set as Public bucket for photo access

## Step 8: Create Admin User

After setup, create an admin user:

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Add email: `admin@yourcompany.com`
4. Set password
5. In SQL Editor, update user metadata:

```sql
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "name": "Admin User"}'
WHERE email = 'admin@yourcompany.com';
```

## Step 9: Restart Application

```bash
npm run dev
```

## ✅ Verification

- Login with admin email → should go to /admin
- Login with regular email → should go to /jobs
- Register new user → should create account

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Next.js App                   │
├─────────────────────────────────────────────────┤
│  src/lib/auth.ts     → Auth service             │
│  src/lib/supabase.ts → Database service         │
│  src/middleware.ts   → Route protection          │
├─────────────────────────────────────────────────┤
│              Supabase Backend                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │ Database │  │ Storage  │       │
│  │  (JWT)   │  │ (Postgres)│  │ (Photos) │       │
│  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

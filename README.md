# HireHub - Modern Hiring Management Web App

A dynamic hiring management web application built with Next.js 15, Supabase, and modern React patterns. Features role-based access for recruiters (Admin) and job seekers (Applicants).

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

## 🚀 Live Demo

**Production URL**: [https://hirehub-hiring-app.vercel.app](https://hirehub-hiring-app.vercel.app)

### Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@hirehub.com` | `Admin123!` | `/admin` dashboard |
| Applicant | `user@hirehub.com` | `User123!` | `/jobs` board |

---

## ✨ Features Implemented

### P0 Requirements (Priority 0 - Core Features)

#### P0.1 - Admin: Job Creation with Dynamic Form Configuration
- ✅ Create/Edit/Delete job postings
- ✅ Configure application form fields per job (mandatory/optional/hidden)
- ✅ Job type selection (Full-time, Intern, Contract)
- ✅ Salary range with Indonesian Rupiah formatting (Rp8.000.000)

#### P0.2 - Applicant: Dynamic Job Application Form
- ✅ Job board with search and filter
- ✅ Dynamic form rendering based on job-specific configuration
- ✅ Real-time validation with Zod schemas
- ✅ File upload support for resume/portfolio

#### P0.3 - Gesture-Based Profile Photo Capture
- ✅ Webcam integration with hand gesture detection
- ✅ 1-2-3 finger gesture sequence for photo capture
- ✅ **Conditional requirement**: Required for full-time, optional for intern/contract
- ✅ Skip photo option for non-required positions

#### P0.4 - Admin: Candidate Management Table
- ✅ View all applications with status tracking
- ✅ Sortable columns (name, date, status)
- ✅ Filter by job, status, and search
- ✅ Update application status (New → Reviewed → Interviewed → Hired/Rejected)
- ✅ Column resizing and reordering

### Additional Features
- ✅ **Duplicate Application Prevention**: Prevents same email applying twice to same job
- ✅ **Role-based Authentication**: Admin vs Applicant access control
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark mode ready**: CSS variables for theming

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5.x |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Styling** | Tailwind CSS 4.0 |
| **UI Components** | Shadcn/UI |
| **State Management** | Zustand |
| **Form Handling** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone Repository

```bash
git clone https://github.com/radiansyah-dev74/hirehub-hiring-app.git
cd hirehub-hiring-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For development (bypasses auth for testing)
DEV_BYPASS_AUTH=true
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the schema from `supabase/schema.sql` in SQL Editor
3. Enable Email auth in Authentication settings
4. (Optional) Disable email confirmation for testing

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   │   ├── candidates/    # Candidate management
│   │   └── jobs/          # Job CRUD
│   ├── jobs/              # Public job board
│   │   └── [jobId]/apply/ # Application form
│   ├── login/             # Authentication
│   └── register/
├── components/
│   ├── application/       # Application-specific components
│   │   └── GestureCamera.tsx
│   ├── layout/            # Layout components
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── auth.ts            # Authentication service
│   ├── supabase.ts        # Supabase client & services
│   ├── validators.ts      # Zod schemas
│   └── formatters.ts      # Utility formatters
├── store/
│   └── index.ts           # Zustand store
└── types/
    └── index.ts           # TypeScript types
```

---

## 🗄️ Database Schema

### Tables

- **jobs** - Job postings with title, department, salary, job_type
- **job_form_configs** - Dynamic field configurations per job
- **applications** - Submitted applications with status tracking

### Key Relationships

```sql
jobs (1) → (many) job_form_configs
jobs (1) → (many) applications
```

---

## 🔐 Authentication

### Roles
- **admin**: Full access to `/admin/*` routes
- **applicant**: Access to `/jobs`, `/applications`, `/profile`

### Middleware Protection
Routes are protected via `middleware.ts` with role-based redirects.

---

## ⚠️ Known Limitations

1. **DEV_BYPASS_AUTH**: When enabled, authentication is skipped for easier testing
2. **Gesture Detection**: Uses simulated button clicks instead of real ML-based detection
3. **Email Confirmation**: Should be disabled in Supabase for demo purposes
4. **File Storage**: Resume/portfolio uploads use base64 encoding (production should use Supabase Storage)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Post-Deployment

Update Supabase Auth settings:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 👨‍💻 Author

Built for hiring management technical assessment.

# HireHub - Project README

A dynamic **Hiring Management Web App** built with Next.js, TailwindCSS, Zustand, and shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Create jobs, configure forms, manage candidates |
| **Applicant** | Browse jobs, submit applications |

## ✨ Features

### Admin Features
- 📊 Dashboard with stats overview
- 📝 Create/edit job postings
- ⚙️ Dynamic form field configuration (mandatory/optional/hidden)
- 📋 Candidate table with sorting, filtering, pagination

### Applicant Features
- 🔍 Search and browse active jobs
- 📄 Dynamic application forms
- 📸 Gesture-based photo capture (1-2-3 finger sequence)
- 📈 Track application status

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand
- **Table**: TanStack Table
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── admin/             # Admin routes
│   ├── jobs/              # Job board routes
│   └── applications/      # Applicant routes
├── components/
│   ├── layout/            # Sidebar, MainLayout
│   ├── ui/                # shadcn/ui components
│   └── application/       # GestureCamera
├── store/                 # Zustand store
├── types/                 # TypeScript types
└── lib/                   # Utilities
```

## 🗄 Database Schema

See `/supabase/schema.sql` for the complete schema.

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 Demo Credentials

The app uses mock data by default. Select a role on the home page to explore.

---

Built with ❤️ using Next.js

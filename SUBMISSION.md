# HireHub Technical Assessment Submission

---

## 1. Candidate Information

| Field | Value |
|-------|-------|
| **Name** | [Your Name] |
| **Email** | [Your Email] |
| **Date** | December 28, 2025 |

---

## 2. Project Links

| Resource | URL |
|----------|-----|
| **Live Demo** | https://hirehub-hiring-app.vercel.app |
| **GitHub Repository** | https://github.com/radiansyah-dev74/hirehub-hiring-app |

---

## 3. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hirehub.com | Admin123! |
| **Applicant** | user@hirehub.com | User123! |

---

## 4. Key Features Implemented

### P0.1 - Admin: Job Creation with Dynamic Form Configuration ✅

**Description:** Admin can create job postings with customizable application form fields.

**Implemented Features:**
- Create, Edit, Delete job postings
- Configure form fields: mandatory, optional, or hidden
- Job type selection (Full-time, Intern, Contract)
- Salary range with Indonesian Rupiah format (Rp8.000.000)

**Location:** `/admin/jobs/new`, `/admin/jobs/[id]/edit`

---

### P0.2 - Applicant: Dynamic Job Application Form ✅

**Description:** Applicants see dynamically rendered form based on job-specific configuration.

**Implemented Features:**
- Job board with search and filter
- Dynamic form rendering based on job configuration
- Mandatory fields marked with asterisk (*)
- Hidden fields not rendered
- Real-time validation with Zod schemas

**Location:** `/jobs`, `/jobs/[jobId]/apply`

---

### P0.3 - Gesture-Based Profile Photo Capture ✅

**Description:** Webcam integration with hand gesture sequence for photo capture.

**Implemented Features:**
- 1-2-3 finger gesture sequence for photo capture
- Conditional requirement based on job type:
  - **Full-time**: Webcam REQUIRED
  - **Intern/Contract**: Webcam OPTIONAL with "Skip Photo" button
- Camera preview and capture countdown

**Location:** `/jobs/[jobId]/apply` (Profile Photo section)

---

### P0.4 - Admin: Candidate Management Table ✅

**Description:** Admin dashboard to view and manage all job applications.

**Implemented Features:**
- View all applications with status tracking
- Sortable columns (name, date, status)
- Filter by job, status, and search
- Update application status (New → Reviewed → Interviewed → Hired/Rejected)
- Column resizing and reordering

**Location:** `/admin/candidates`

---

## 5. Additional Features

| Feature | Description |
|---------|-------------|
| **Duplicate Prevention** | Prevents same email from applying twice to same job |
| **Role-based Auth** | Admin vs Applicant access control |
| **Salary Formatting** | Indonesian Rupiah format (RpX.XXX.XXX) |
| **Responsive Design** | Works on desktop and mobile |

---

## 6. Test Results Summary

| Test | Feature | Status |
|------|---------|--------|
| TEST 1 | Job Creation with Form Config | ✅ PASS |
| TEST 2 | Dynamic Form Rendering | ✅ PASS |
| TEST 3 | Duplicate Application Prevention | ✅ PASS |
| TEST 4 | Webcam Conditional Requirement | ✅ PASS |
| TEST 5 | Salary Format Display | ✅ PASS |

### Test Evidence
Screenshots and recordings available in repository under `docs/` folder.

---

## 7. Known Limitations

| Limitation | Description |
|------------|-------------|
| **Auth Bypass Mode** | `DEV_BYPASS_AUTH=true` available for testing without login |
| **Gesture Detection** | Uses simulated buttons instead of ML-based detection |
| **File Storage** | Uses base64 encoding instead of Supabase Storage |
| **Email Confirmation** | Should be disabled in Supabase for demo |

---

## 8. Setup Instructions for Evaluator

### Quick Start (5 minutes)

1. **Clone Repository**
   ```bash
   git clone https://github.com/radiansyah-dev74/hirehub-hiring-app.git
   cd hirehub-hiring-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abnhrqavmsfncsvhwefr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[provided in email]
   DEV_BYPASS_AUTH=true
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   - Job Board: http://localhost:3000/jobs
   - Admin Dashboard: http://localhost:3000/admin

### Testing Checklist

- [ ] Create new job with custom form config
- [ ] Apply to job as applicant
- [ ] Verify dynamic form fields render correctly
- [ ] Test webcam for full-time vs intern job
- [ ] Check duplicate application prevention
- [ ] Update application status as admin

---

## 9. Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS 4.0 |
| UI | Shadcn/UI |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## 10. Contact

For questions or clarifications, please contact: [Your Email]

---

*Document generated: December 28, 2025*

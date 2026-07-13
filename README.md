# MedLink

Telemedicine platform for patients, verified doctors, and administrators.

## Structure

- `frontend/` — React + TypeScript application
- `backend/` — Node.js + TypeScript API
- `supabase/` — database schema and migrations

## Deployment

The production web application is deployed from `frontend/` as a Vite project. Supabase provides Auth, PostgreSQL, Storage, RLS, RPC functions, and Edge Functions.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the required Vercel settings, environment variables, and production checklist.

## Development Roadmap

> **General rule:** Each step below must be fully completed and approved before starting the next one. After completing each step, present the result for review and wait for confirmation before proceeding.

### STEP 1 — Files & Folders (Project Structure)

**What gets done:**

- Create the main project folder.
- Separate the application into `frontend/` (React + TypeScript) and `backend/` (Node.js + TypeScript).
- Prepare the following base structure:

```text
medlink/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── patient/
│   │   │   ├── doctor/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/         # Supabase client and API calls
│   │   ├── types/            # TypeScript interfaces
│   │   ├── context/          # Authentication and role contexts
│   │   ├── utils/
│   │   ├── i18n/             # EN, IT, DE, AR
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/       # Authentication and role checks
│   │   ├── services/         # Supabase client
│   │   ├── types/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── supabase/
│   ├── migrations/
│   └── schema.sql
└── README.md
```

**Expected result:** The folder structure is ready, the Git repository is initialized, and `package.json` is configured for both the frontend and backend.

### STEP 2 — Supabase Setup

**What gets done:**

- Create the Supabase project.
- Set up the core PostgreSQL tables:
  - `profiles` — unified user profiles linked to patient, doctor, and admin roles.
  - `doctor_verifications` — certificates, university details, and license information.
  - `conversations`.
  - `messages`.
  - `reports`.
  - `discussion_threads` and `discussion_comments` — doctors only.
- Configure the `certificates`, `chat-files`, and `reports` Storage buckets.
- Connect `@supabase/supabase-js` to the frontend and backend.
- Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in environment files.

**Expected result:** The Supabase project works, the database tables are created, and both frontend and backend connections are tested.

### STEP 3 — Authentication & Authorization

**What gets done:**

- Use Supabase Auth for email/password authentication, with social login available if needed.
- Provide separate registration flows:
  - Simple patient registration.
  - Doctor registration with certificate upload and a pending-approval state.
- Use one login form and redirect users to the appropriate dashboard based on their role.
- Apply Row Level Security (RLS) policies:
  - Patients can only access their own data.
  - Doctors can only access their assigned patients.
  - The Discussion Panel is restricted to doctors.
  - Administrators can access all authorized management data.
- Verify authentication and roles in backend middleware for every protected session.

**Expected result:** Users can register and log in, roles are recognized correctly, and RLS permission boundaries work as intended.

### STEP 4 — Modules & Features

The sub-steps below are completed sequentially and reviewed individually.

#### 4.1 Dashboard

- General dashboard foundation.
- Role-specific patient, doctor, and admin dashboard experiences.

#### 4.2 Patient Module

- Doctor list, selection, filtering, and search.
- Real-time chat.
- Voice messages and voice consultation support.
- Secure file sharing.
- Video consultation support.

#### 4.3 Doctor Module

- Doctor verification document upload and pending state.
- Patient list and consultation responses.
- Doctors-only Discussion Panel.

#### 4.4 Admin Module

- User approval and suspension management.
- Doctor verification review.
- System settings.
- Analytics dashboard.

#### 4.5 Reports

- Patient reports.
- Doctor reports.
- Admin reports.
- PDF and CSV export.

**Expected result:** Every feature works and is tested before moving to the next module.

### STEP 5 — User Roles, Permissions & Final QA

**What gets done:**

- Test the Patient, Doctor, and Admin roles end to end.
- Confirm that each role can only view and perform its intended actions.
- Test permission and workflow edge cases:
  - A doctor who is still pending approval.
  - A patient who has not selected a doctor.
  - An administrator suspending an account.
- Complete a final quality-assurance pass across the system.

**Expected result:** The complete application is tested across all three roles and is ready for production launch.

### General Working Process

1. Complete each step fully.
2. Present the completed result for review.
3. Begin the next step only after approval such as “this looks good.”
4. If changes are requested, finish them before continuing to the next step.

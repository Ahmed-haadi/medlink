# MedLink

Telemedicine platform for patients, verified doctors, and administrators.

## Structure

- `frontend/` — React + TypeScript application
- `backend/` — Node.js + TypeScript API
- `supabase/` — database schema and migrations

## Deployment

The production web application is deployed from `frontend/` as a Vite project. Supabase provides Auth, PostgreSQL, Storage, RLS, RPC functions, and Edge Functions.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the required Vercel settings, environment variables, and production checklist.

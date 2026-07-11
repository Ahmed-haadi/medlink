# MedLink deployment

## Vercel project settings

Import the GitHub repository and configure one Vercel project with:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: a version matching `frontend/package.json` (`>=22.12.0`)

The repository root is a monorepo. Do not use the repository root or `backend` as the Vercel Root Directory for the web application.

## Required environment variables

Add both variables to Production and Preview environments in Vercel:

```text
VITE_SUPABASE_URL=https://fqkirbsqsiqpgmvbvenk.supabase.co
VITE_SUPABASE_ANON_KEY=<the public anon JWT from Supabase>
```

Never add `SUPABASE_SERVICE_ROLE_KEY` to Vercel for this frontend project. Every variable prefixed with `VITE_` is included in the browser bundle.

After changing an environment variable, redeploy the Vercel project.

## Supabase production settings

The database migrations, RLS policies, storage buckets, and `public-signup` Edge Function are hosted by Supabase and are not built by Vercel.

After Vercel assigns the production domain:

1. Open Supabase Dashboard → Authentication → URL Configuration.
2. Set **Site URL** to the final Vercel production URL.
3. Add the production URL and any intended preview URL patterns to **Redirect URLs** before enabling OAuth or email-link flows.
4. Keep the service-role key only in trusted server-side Supabase/Vercel environments; never put it in the frontend.

## Deployment verification

After the first production deployment, test:

1. Patient sign-up and login.
2. Doctor application and certificate upload.
3. Admin approval/rejection.
4. Patient doctor directory and appointment request.
5. Doctor appointment queue.
6. Logout and role-based navigation.
7. CSV download and Print/Save as PDF.

## Current architecture

- `frontend/`: deployed to Vercel.
- `supabase/`: database, Auth, Storage, RLS, RPC functions, and Edge Functions hosted by Supabase.
- `backend/`: an optional Express API scaffold. The frontend does not currently depend on it, so it is not part of this Vercel deployment.

# SensiGlove

Vite + React website with Supabase Auth and a Supabase-backed settings table.

## Local setup

1. Install Node.js with npm.
2. Copy `.env.example` to `.env`.
3. Fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

4. Install and run:

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Go to **Authentication > Providers > Email** and enable email/password auth.
3. Go to **SQL Editor** and run `supabase-setup.sql`.
4. Go to **Authentication > URL Configuration** and set:

```text
Site URL: https://your-vercel-domain.vercel.app
Redirect URLs:
http://localhost:5173
http://localhost:5173/*
https://your-vercel-domain.vercel.app
https://your-vercel-domain.vercel.app/*
```

## Vercel setup

1. Import this GitHub repo in Vercel.
2. Use the Vite defaults:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

3. Add environment variables in **Project Settings > Environment Variables**:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Redeploy after adding or changing environment variables.

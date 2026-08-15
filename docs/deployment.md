# Deployment

- **Frontend:** Vercel.
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions).
- **Environment variables:** set in Vercel project settings and Supabase
  Edge Function secrets — never committed to the repo. See `.env.example`
  for the full list.
- **Migrations:** applied to Supabase via the Supabase CLI/migrations
  before deploying code that depends on them.

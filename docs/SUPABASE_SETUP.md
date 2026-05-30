# Supabase Setup Guide

## Overview

This guide walks through setting up the Victoriosa marketplace database in Supabase with full Row-Level Security (RLS) policies.

## Prerequisites

- Supabase account at https://supabase.com
- Victoriosa project created in Supabase
- Access to Supabase SQL editor

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Project Name: `victoriosa-marketplace`
   - Database Password: (generate a strong password)
   - Region: Choose closest to Uruguay (e.g., `us-east-1` or `sa-east-1`)
4. Click "Create new project"
5. Wait for the project to initialize (2-3 minutes)

## Step 2: Get Supabase Credentials

1. In the Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only!)

3. Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Step 3: Execute Schema SQL

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `docs/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**
6. Verify all tables and policies are created successfully

## Step 4: Create Storage Buckets

1. Go to **Storage** in the Supabase sidebar
2. Create two new buckets:
   - **Bucket name:** `products`
     - Make it **Public** (for product images)
   - **Bucket name:** `supplier-uploads`
     - Make it **Private** (for CSV/JSON imports)

## Step 5: Enable RLS on Storage

1. Go to **Storage > products**
2. Click **"Policies"** tab
3. Create policy:
   - Policy Name: `Allow public read`
   - Permissions: `SELECT`
   - Target Roles: `anon, authenticated`
   - With expression: Leave empty (allow all)

4. For `supplier-uploads`:
   - Policy Name: `Suppliers can read/write own uploads`
   - Permissions: `SELECT, INSERT, UPDATE, DELETE`
   - With expression: `(auth.uid() = owner_id)`

## Step 6: Test Database Connection

1. Return to your Next.js project
2. Create a test page at `src/app/api/health/route.ts`:

```typescript
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) throw error
    
    return Response.json({ status: 'ok', message: 'Database connected' })
  } catch (err) {
    return Response.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    )
  }
}
```

3. Run `npm run dev` and visit http://localhost:3000/api/health
4. Should return `{ status: 'ok', message: 'Database connected' }`

## Step 7: Create Admin User

1. In Supabase dashboard, go to **Authentication > Users**
2. Click **"Add user"**
3. Email: `admin@victoriosa.com`
4. Password: (generate strong password, store securely)
5. Click **"Create user"**
6. After user is created, go to **SQL Editor** and run:

```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'admin@victoriosa.com';
```

## Step 8: Test Policies

Create a test route at `src/app/api/test-policies/route.ts`:

```typescript
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test 1: Unauthenticated read products (should be empty - no active products yet)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
    
    // Test 2: Try to read user profiles (should fail - RLS protection)
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
    
    return Response.json({
      test1_products: products?.length || 0,
      test2_profiles_error: error?.message || 'No error'
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
```

## Common Issues

### Issue: "role" is not in user_profiles
**Solution:** Run the schema again or manually add the role column:
```sql
ALTER TABLE public.user_profiles ADD COLUMN role text DEFAULT 'customer';
```

### Issue: RLS policies blocking legitimate queries
**Solution:** Check that policies have correct role checks and that the user role is set in user_profiles

### Issue: Can't upload files to storage
**Solution:** Ensure storage buckets exist and policies are created correctly

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ RLS policies restrict data access by role
- ✅ Service role key stored server-side only
- ✅ Anon key in environment (never secrets)
- ✅ Storage buckets created with appropriate permissions
- ✅ No raw admin queries in frontend code

## Next Steps

After schema setup:
1. Move to **Prompt 04** - Build product admin CRUD interface
2. Create authenticated admin routes
3. Implement product upload/edit/delete UI

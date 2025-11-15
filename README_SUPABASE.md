# Supabase Integration Setup

## Quick Start

### 1. Install Dependencies ✅
Already installed: `@supabase/supabase-js`

### 2. Create Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready (~2 minutes)

### 3. Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### 4. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Create Database Tables

Go to **SQL Editor** in Supabase and run the SQL from `SUPABASE_SETUP.md`

### 6. Test Connection

Restart your dev server:
```bash
npm run dev
```

The application will automatically detect if Supabase is configured and use it instead of localStorage.

## Files Created

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase.types.ts` - TypeScript types for database
- `src/lib/supabase.helpers.ts` - Helper functions for CRUD operations
- `src/hooks/useSupabaseSync.ts` - Hook for syncing with Supabase
- `SUPABASE_SETUP.md` - Detailed setup instructions with SQL

## Current Status

✅ Supabase client installed and configured
✅ Helper functions created
✅ Type definitions ready
⏳ Store integration (next step - can be done when ready)
⏳ Real-time subscriptions (next step)

## Next Steps

1. Complete database setup in Supabase
2. Update `useDashboardStore.ts` to sync with Supabase
3. Add real-time subscriptions for workflow updates
4. Test data persistence

## Fallback Behavior

If Supabase is not configured, the app will continue using localStorage (current behavior).


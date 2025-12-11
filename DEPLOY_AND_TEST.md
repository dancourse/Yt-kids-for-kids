# Deploy and Test Instructions

The branch `netlify-db-exploration` has been pushed to GitHub! ✅

## Step 1: Deploy to Netlify

Since you already have this project connected to Netlify, you have two options:

### Option A: Deploy via Netlify Dashboard (Recommended)

1. Go to your Netlify dashboard: https://app.netlify.com
2. Find your KiddoTube site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**
5. Or select the `netlify-db-exploration` branch from the branch selector

### Option B: Merge to Main (if ready)

If you want to make this the live version:
1. Merge the PR or merge locally: `git checkout main && git merge netlify-db-exploration && git push`
2. Netlify will auto-deploy main

## Step 2: Verify Environment Variables

Make sure these are set in Netlify Dashboard → Site Settings → Environment Variables:

✅ Already set (you mentioned these):
- `NETLIFY_DATABASE_URL`
- `NETLIFY_DATABASE_URL_UNPOOLED`

✅ Should already be there from before:
- `YOUTUBE_API_KEY`
- `JWT_SECRET`
- `PARENT_PASSWORD_HASH`

## Step 3: Initialize the Database

Once deployed, you need to create the database tables. You have two options:

### Option A: Use Netlify Functions to Initialize

Create a temporary one-time function to run the initialization:

1. I can create an admin endpoint that runs the initialization
2. You visit it once: `https://your-site.netlify.app/api/init-database-admin`
3. It creates all tables

### Option B: Use Database Console

If Netlify DB has a console/query interface:
1. Copy the contents of `netlify/db/schema.sql`
2. Paste into the Netlify DB console
3. Run it

**Which would you prefer? I can set up Option A right now!**

## Step 4: Test the Connection

Once deployed and initialized, visit:
```
https://your-site.netlify.app/api/test-db-connection
```

You should see:
```json
{
  "status": "connected",
  "message": "Database connection successful!",
  "details": {
    "currentTime": "2025-12-11T...",
    "postgresVersion": "PostgreSQL 15.x...",
    "tablesFound": [
      "app_config",
      "approved_creators",
      "approved_videos",
      "blocked_videos",
      "profiles",
      "watch_history"
    ],
    "profileCount": 2,
    "schemaInitialized": true
  }
}
```

## What's Your Netlify Site URL?

Let me know your Netlify site URL and I can:
1. Create the admin initialization endpoint
2. Give you the exact URLs to test
3. Help verify everything works

Just say "create the admin endpoint" and tell me your site URL!

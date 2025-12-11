# Quick Connection Test Guide

## Step 1: Add Environment Variables

Add these to your `.env` file (you mentioned you have them from Netlify):

```env
NETLIFY_DATABASE_URL=postgresql://...
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://...
```

## Step 2: Initialize the Database

Run this command to create all tables:

```bash
node scripts/init-db.js
```

You should see:
```
Initializing Netlify DB...
📋 Running schema.sql...
✅ Schema initialized successfully!
📊 Tables in database:
  - app_config
  - approved_creators
  - approved_videos
  - blocked_videos
  - profiles
  - watch_history
```

## Step 3: Test via Netlify Dev

```bash
netlify dev
```

Then open your browser to:
```
http://localhost:8888/api/test-db-connection
```

**What you should see:**
```json
{
  "status": "connected",
  "message": "Database connection successful!",
  "details": {
    "currentTime": "2025-12-11T...",
    "postgresVersion": "PostgreSQL 15.x...",
    "tablesFound": ["app_config", "approved_creators", "approved_videos", "blocked_videos", "profiles", "watch_history"],
    "profileCount": 2,
    "schemaInitialized": true
  }
}
```

## If Something Goes Wrong

### Error: "NETLIFY_DATABASE_URL environment variable is not set"
- Double-check your `.env` file exists in the project root
- Make sure the variable name is exactly `NETLIFY_DATABASE_URL`
- Restart `netlify dev` after adding the variable

### Error: "relation 'profiles' does not exist"
- Run the init script: `node scripts/init-db.js`
- Check for any errors in the output

### Connection timeout
- Verify the database URL is correct (copy from Netlify dashboard)
- Check your internet connection
- Try the unpooled URL instead

## What's Been Built

### 1. Database Schema (`netlify/db/schema.sql`)
Complete Postgres schema with 6 tables replacing Netlify Blobs structure.

### 2. Database Utilities (`netlify/functions/utils/db.js`)
All the functions you need:
- `getProfiles()`, `getProfile(id)`, `updateProfile(id, data)`
- `getApprovedCreators(profileId)`, `addApprovedCreator()`, `removeApprovedCreator()`
- `getApprovedVideos(profileId)`, `addApprovedVideo()`, `removeApprovedVideo()`
- `blockVideo()`, `unblockVideo()`, `getBlockedVideos()`
- `getWatchHistory()`, `recordWatch()`
- And more...

### 3. Test Endpoint (`/api/test-db-connection`)
Simple endpoint to verify everything is working.

### 4. Sample Endpoint (`/api/profiles-db`)
Example of how to convert an endpoint from Blobs to DB.

## Next Steps After Connection Works

1. Test the sample `profiles-db` endpoint
2. Convert the remaining endpoints one by one
3. Test each endpoint as you convert it
4. Once all endpoints work, remove the Blobs code
5. Deploy to Netlify and test in production

See `NETLIFY_DB_SETUP.md` for full documentation!

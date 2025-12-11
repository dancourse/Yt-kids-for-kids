# Netlify DB Setup Guide

This guide covers setting up and using Netlify DB (Neon Postgres) as a replacement for Netlify Blobs.

## What's Been Created

### 1. Database Schema (`netlify/db/schema.sql`)
Defines the complete database structure:
- **profiles**: Kid profiles with avatars, silly names, and PIN hashes
- **approved_creators**: YouTube channels approved by parents
- **approved_videos**: Individual videos (manually added or from creators)
- **blocked_videos**: Videos blocked by parents (overrides approvals)
- **watch_history**: Video watch events with duration
- **app_config**: Application configuration (parent password hash, etc.)

### 2. Database Utilities (`netlify/functions/utils/db.js`)
Wrapper functions for all database operations:
- Profile CRUD operations
- Creator management
- Video approvals and blocking
- Watch history tracking
- Config management

### 3. Test Endpoint (`netlify/functions/test-db-connection.js`)
Simple endpoint to verify database connectivity:
- Tests connection
- Shows Postgres version
- Lists existing tables
- Counts profiles

### 4. Initialization Script (`scripts/init-db.js`)
Node script to initialize the database schema.

### 5. Sample Endpoint (`netlify/functions/profiles-db.js`)
Example of a converted endpoint using the new database.

## Setup Instructions

### Step 1: Environment Variables

Make sure these environment variables are set in your `.env` file:

```env
# Existing variables
YOUTUBE_API_KEY=your_youtube_api_key_here
JWT_SECRET=your_jwt_secret_here
PARENT_PASSWORD_HASH=your_bcrypt_hash_here

# New Netlify DB variables (provided by Netlify)
NETLIFY_DATABASE_URL=your_database_url_here
NETLIFY_DATABASE_URL_UNPOOLED=your_unpooled_database_url_here
```

**Note**: The `NETLIFY_DATABASE_URL` variables are automatically provided when you add the Netlify DB extension to your site. You can find them in:
- Netlify Dashboard → Your Site → Environment Variables
- Or copy them from the Netlify DB settings page

### Step 2: Initialize the Database Schema

Run the initialization script to create all tables:

```bash
node scripts/init-db.js
```

Expected output:
```
Initializing Netlify DB...
📋 Running schema.sql...
  Executing statement 1/N...
  ...
✅ Schema initialized successfully!

📊 Tables in database:
  - app_config
  - approved_creators
  - approved_videos
  - blocked_videos
  - profiles
  - watch_history

👤 Profiles in database:
  - profile_1: Captain Bubbles
  - profile_2: Professor Giggles

✨ Database is ready to use!
```

### Step 3: Test the Connection

#### Option A: Using Netlify Dev

```bash
netlify dev
```

Then visit: `http://localhost:8888/api/test-db-connection`

#### Option B: Using the deployed site

After deploying to Netlify, visit:
```
https://your-site.netlify.app/api/test-db-connection
```

**Expected Response:**
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

### Step 4: Test a Sample Endpoint

Test the profiles endpoint with database backend:

```bash
# First, get a parent auth token
curl -X POST http://localhost:8888/api/auth-parent-login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_parent_password"}'

# Use the token to fetch profiles (using the new DB endpoint)
curl http://localhost:8888/api/profiles-db \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "profiles": [
    {
      "id": "profile_1",
      "avatarId": "rocket",
      "sillyName": "Captain Bubbles",
      "pinHash": "",
      "createdAt": "2025-12-11T..."
    },
    {
      "id": "profile_2",
      "avatarId": "dinosaur",
      "sillyName": "Professor Giggles",
      "pinHash": "",
      "createdAt": "2025-12-11T..."
    }
  ]
}
```

## Database Schema Overview

### Profiles Table
```sql
CREATE TABLE profiles (
  id VARCHAR(50) PRIMARY KEY,           -- 'profile_1', 'profile_2'
  avatar_id VARCHAR(50),                -- 'rocket', 'dinosaur', etc.
  silly_name VARCHAR(100),              -- 'Captain Bubbles', etc.
  pin_hash VARCHAR(255),                -- bcrypt hash of 4-digit PIN
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Approved Creators Table
```sql
CREATE TABLE approved_creators (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) REFERENCES profiles(id),
  channel_id VARCHAR(100),              -- YouTube channel ID
  channel_name VARCHAR(255),
  channel_thumbnail TEXT,
  uploads_playlist_id VARCHAR(100),     -- For fetching channel videos
  added_at TIMESTAMP,
  UNIQUE(profile_id, channel_id)
);
```

### Approved Videos Table
```sql
CREATE TABLE approved_videos (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) REFERENCES profiles(id),
  video_id VARCHAR(100),                -- YouTube video ID
  title VARCHAR(500),
  thumbnail TEXT,
  channel_name VARCHAR(255),
  channel_id VARCHAR(100),
  duration VARCHAR(50),
  added_at TIMESTAMP,
  source VARCHAR(20),                   -- 'manual' or 'creator'
  creator_id INTEGER REFERENCES approved_creators(id),
  UNIQUE(profile_id, video_id)
);
```

### Blocked Videos Table
```sql
CREATE TABLE blocked_videos (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) REFERENCES profiles(id),
  video_id VARCHAR(100),
  reason TEXT,
  blocked_at TIMESTAMP,
  UNIQUE(profile_id, video_id)
);
```

## Migration Path

To migrate from Netlify Blobs to Netlify DB:

1. **Keep existing endpoints working** - Don't change blob endpoints yet
2. **Create parallel DB endpoints** - Test with `-db` suffix (e.g., `profiles-db.js`)
3. **Test thoroughly** - Ensure DB endpoints work correctly
4. **Switch over** - Replace blob endpoints with DB versions
5. **Data migration** - If needed, write a script to copy blob data to DB

## Troubleshooting

### Error: "NETLIFY_DATABASE_URL environment variable is not set"
- Check your `.env` file has the variable
- For Netlify Dev, make sure `.env` is in the project root
- For production, check Netlify Dashboard → Environment Variables

### Error: "relation 'profiles' does not exist"
- Run the initialization script: `node scripts/init-db.js`
- Check that the script completed without errors

### Connection timeouts
- Use `NETLIFY_DATABASE_URL` (pooled) for most operations
- Use `NETLIFY_DATABASE_URL_UNPOOLED` only for long-running queries or transactions

### Schema changes
- To modify the schema, update `schema.sql`
- Create migration scripts for production databases
- Test locally first

## Next Steps

1. ✅ Database schema created
2. ✅ Utility functions created
3. ✅ Test endpoint created
4. ✅ Sample endpoint converted
5. ⏭️ Test the connection (see Step 3 above)
6. ⏭️ Convert remaining endpoints from Blobs to DB
7. ⏭️ Update frontend API calls if needed
8. ⏭️ Deploy and test in production

## Resources

- [Netlify DB Documentation](https://docs.netlify.com/build/data-and-storage/netlify-db/)
- [Neon Postgres Documentation](https://neon.tech/docs)
- [SQL Syntax Reference](https://www.postgresql.org/docs/current/sql.html)

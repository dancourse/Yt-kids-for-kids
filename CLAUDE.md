# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KiddoTube is a family-use web application providing parent-controlled YouTube viewing for children. Parents curate approved content (channels and videos), and children can only watch explicitly approved content for their profile.

**Key principle**: No algorithmic recommendations or browsing outside approved content.

## Development Commands

### Local Development

```bash
# Install dependencies
npm install

# Development server with Vite only (frontend only, functions won't work)
npm run dev

# Development server with Netlify Functions support (recommended)
netlify dev
```

**Important**: Use `netlify dev` for full-stack development. The Vite dev server (`npm run dev`) only runs the frontend and proxies API calls to port 8888, but Netlify Functions won't be available. The Netlify CLI must be installed globally: `npm install -g netlify-cli`.

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Create a `.env` file with:
- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `JWT_SECRET`: Random secure string for JWT signing
- `PARENT_PASSWORD_HASH`: bcrypt hash of parent password

Generate parent password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

## Architecture

### Frontend (React + Vite)

**Two distinct user interfaces:**

1. **Kid Interface** (`/`)
   - Profile selection with avatars and silly names
   - PIN entry for authentication (4-digit)
   - Video grid showing only approved content
   - Full-screen YouTube player
   - No navigation outside approved videos

2. **Parent Dashboard** (`/parent`)
   - Password authentication
   - Profile management (avatars, names, PINs)
   - Content approval (creators and videos)
   - Block specific videos
   - Watch history monitoring

**Routing**: Uses React Router with routes defined in `src/App.jsx`

**State Management**: Local component state + localStorage for auth tokens and profile data

**Authentication Flow**:
- Frontend stores JWT tokens in localStorage (`kiddotube_token`)
- Tokens included in all API requests via `Authorization: Bearer <token>` header
- Parent tokens: 24h expiry
- Kid tokens: 4h expiry

### Backend (Netlify Functions)

**Serverless architecture** with file-based routing:
- Functions live in `netlify/functions/`
- URL pattern: `/api/<function-name>` maps to `netlify/functions/<function-name>.js`
- Function names use dashes for path segments (e.g., `profiles-profileId-videos.js` → `/api/profiles/:profileId/videos`)

**Shared utilities** in `netlify/functions/utils/`:
- `storage.js`: Netlify Blobs operations (getBlob, setBlob, deleteBlob)
- `auth.js`: JWT generation/verification, bcrypt password hashing, auth middleware
- `youtube.js`: YouTube API calls, URL parsing (video/channel IDs)
- `response.js`: Standardized HTTP responses

**Data Storage (Netlify Blobs)**:
- `config`: Parent password hash
- `profiles`: Array of 2 kid profiles (profile_1, profile_2)
- `approvals_<profileId>`: Approved creators, videos, and blocked videos per profile
- `history_<profileId>`: Watch history per profile

**Storage pattern**: All Blobs functions use the store name `'kiddotube'` from `@netlify/blobs`

### Authentication & Authorization

**Two auth roles**:
- `parent`: Full access to all endpoints, can manage profiles and content
- `kid`: Limited access, can only view/watch approved content for their own profile

**Auth middleware patterns**:
- `requireParentAuth(event)`: Parent-only endpoints
- `requireAuth(event)`: Either parent or kid (with role checking)
- `requireKidAuth(event, profileId)`: Kid-only with profile ownership validation

**Password/PIN hashing**:
- All passwords/PINs stored as bcrypt hashes (10 rounds)
- Parent password hash from environment variable `PARENT_PASSWORD_HASH`
- Kid PINs stored in profile objects

### YouTube Integration

**API Usage**:
- All YouTube API calls happen server-side in Netlify Functions
- Never expose API key to frontend
- Functions in `youtube.js` handle URL parsing and API requests

**Content approval logic**:
- **Approved Creators**: Adding a channel approves all current videos from that channel
- **Approved Videos**: Individual videos added manually
- **Blocked Videos**: Block list overrides approved content (can block videos from approved creators)

**Video filtering**: When fetching videos for kids, filter out `blockedVideos` from the combined set of creator videos and manually approved videos.

### API Endpoint Naming Convention

Functions use dash-separated names for path parameters:
- `profiles-profileId.js` → `/api/profiles/:profileId`
- `profiles-profileId-videos-videoId-block.js` → `/api/profiles/:profileId/videos/:videoId/block`

Parse path parameters in handlers:
```javascript
const pathParts = event.path.split('/').filter(Boolean);
const profileId = pathParts[pathParts.length - 2]; // adjust index as needed
```

### Frontend API Client Pattern

`src/lib/api.js` provides a centralized API client that:
- Automatically includes auth headers from localStorage
- Handles JSON request/response bodies
- Maps friendly method names to Netlify Function endpoints
- Throws errors for non-OK responses

Usage:
```javascript
import { api } from '@/lib/api';

// Authentication
await api.parentLogin(password);
await api.kidLogin(profileId, pin);

// Videos
const { videos } = await api.getVideos(profileId);
await api.addVideo(profileId, videoUrl);
```

## Key Implementation Details

### Netlify Functions Handler Pattern

All functions follow this structure:
```javascript
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions(); // CORS
  }

  try {
    await initializeData(); // Ensure Blobs data exists

    // Auth check
    const payload = requireParentAuth(event);

    // Parse request
    const data = JSON.parse(event.body);

    // Business logic
    // ...

    return successResponse({ ... });
  } catch (error) {
    return errorResponse(error, statusCode);
  }
}
```

### Video Approval Flow

1. Parent adds creator URL → YouTube API fetches channel info + recent videos → Store channel metadata + all videos
2. Parent adds video URL → YouTube API fetches video info → Store video metadata
3. Kid requests videos → Fetch approved creators' videos + manual videos → Filter out blocked videos → Return combined list

### Watch History Recording

When kid watches a video:
- POST to `/api/profiles/:profileId/history` with `{ videoId, watchDuration }`
- Requires kid auth token
- Stores timestamp, videoId, and duration in profile's history blob

## Development Patterns

### Adding a New API Endpoint

1. Create function file: `netlify/functions/<endpoint-name>.js`
2. Export `handler` function
3. Use auth middleware from `utils/auth.js`
4. Use storage helpers from `utils/storage.js`
5. Return responses using `utils/response.js`
6. Add method to `src/lib/api.js` for frontend access

### Adding a New Component

**Kid components**: Place in `src/components/kids/`
**Parent components**: Place in `src/components/parent/`

Follow existing patterns:
- Tailwind CSS for styling (colorful, playful for kids; clean, minimal for parents)
- Use `src/lib/api.js` for data fetching
- Use `src/lib/auth.js` for auth state

### Storage Schema Changes

When modifying data structure:
1. Update `initializeData()` in `netlify/functions/utils/storage.js`
2. Update all functions reading/writing that data
3. Consider migration for existing Netlify Blobs data (there's no automatic migration)

## Important Constraints

- **Two profiles only**: System designed for exactly 2 kid profiles (profile_1, profile_2)
- **No real names**: Only silly names and avatars for privacy
- **No email/account system**: Single parent password for the household
- **YouTube API quota**: 10,000 units/day (each video info fetch = 3 units, channel videos = 6+ units)
- **Netlify Blobs**: Data persists in production Netlify environment, but requires special setup for local dev

## Deployment

Deployed on Netlify:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Environment variables must be set in Netlify dashboard

**Important**: Set all environment variables in Netlify UI before deploying.

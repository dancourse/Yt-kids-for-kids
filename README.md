# KiddoTube 🚀

A private, family-use web application that provides a safe, parent-controlled YouTube viewing experience for children. Parents curate approved content (channels and individual videos), and children can only watch what's been explicitly approved for their profile.

## Features

### For Kids
- **Colourful, Playful Interface** - Inspired by YouTube Kids with fun animations
- **Profile Selection** - Choose your profile with fun avatars and silly names
- **PIN Protection** - Simple 4-digit PIN keeps profiles secure
- **Safe Video Grid** - Only approved videos are shown
- **Full-Screen Player** - YouTube embed with simple controls
- **No Rabbit Holes** - No recommendations, no browsing outside approved content

### For Parents
- **Clean Dashboard** - Manage both kid profiles easily
- **Approve Creators** - Add entire YouTube channels
- **Approve Videos** - Add individual videos by URL
- **Block Videos** - Block specific videos even from approved creators
- **Watch History** - See what your kids have been watching

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Netlify Functions (Node.js)
- **Storage**: Netlify Blobs
- **Authentication**: JWT with bcrypt
- **APIs**: YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/apis/api/youtube.googleapis.com))
- Netlify account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Yt-kids-for-kids
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   YOUTUBE_API_KEY=your_youtube_api_key_here
   JWT_SECRET=your_random_secure_string_here
   PARENT_PASSWORD_HASH=$2a$10$...
   ```

   To generate the parent password hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Development with Netlify CLI

For local testing with Netlify Functions:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Run dev server**
   ```bash
   netlify dev
   ```

## Deployment to Netlify

### Step 1: Prepare Your Site

1. **Build the project** to ensure everything compiles:
   ```bash
   npm run build
   ```

### Step 2: Deploy to Netlify

1. **Connect to Netlify**
   ```bash
   netlify init
   ```

2. **Set environment variables** in Netlify dashboard:
   - Go to Site settings > Environment variables
   - Add:
     - `YOUTUBE_API_KEY`
     - `JWT_SECRET`
     - `PARENT_PASSWORD_HASH`

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

   Or push to your connected Git repository and Netlify will auto-deploy.

## Project Structure

```
kiddotube/
├── src/
│   ├── components/
│   │   ├── kids/           # Kid-facing components
│   │   │   ├── ProfileCard.jsx
│   │   │   ├── PinEntry.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   └── VideoPlayer.jsx
│   │   └── parent/         # Parent dashboard components
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── ProfileManager.jsx
│   │       ├── ProfileSettings.jsx
│   │       ├── CreatorManager.jsx
│   │       ├── VideoManager.jsx
│   │       └── WatchHistory.jsx
│   ├── pages/
│   │   ├── ProfileSelect.jsx
│   │   ├── WatchPage.jsx
│   │   └── parent/
│   │       └── ParentDashboard.jsx
│   ├── lib/
│   │   ├── api.js          # API client
│   │   ├── auth.js         # Auth helpers
│   │   └── constants.js    # Avatars, names, etc.
│   └── styles/
│       └── index.css
├── netlify/
│   └── functions/
│       ├── utils/          # Shared utilities
│       │   ├── storage.js
│       │   ├── auth.js
│       │   ├── youtube.js
│       │   └── response.js
│       ├── auth-*.js       # Auth endpoints
│       ├── profiles-*.js   # Profile endpoints
│       └── youtube-*.js    # YouTube helper endpoints
├── netlify.toml
└── package.json
```

## Usage

### Initial Setup

1. **Access Parent Dashboard**
   - Navigate to `/parent`
   - Enter parent password

2. **Set Up Profiles**
   - For each profile:
     - Choose an avatar
     - Select a silly name
     - Set a 4-digit PIN

3. **Add Content**
   - Add YouTube channels (all videos automatically approved)
   - Or add individual videos by URL
   - Block specific videos if needed

### Kid Experience

1. **Select Profile**
   - Navigate to home `/`
   - Tap your profile

2. **Enter PIN**
   - Enter your 4-digit PIN

3. **Watch Videos**
   - Tap any video to watch
   - Tap "Back to Videos" when done
   - Use "Switch Profile" to log out

## API Endpoints

### Authentication
- `POST /api/auth/parent-login` - Parent login
- `POST /api/auth/kid-login` - Kid login with PIN

### Profiles
- `GET /api/profiles` - Get all profiles (parent auth)
- `GET /api/profiles/:id/public` - Get public profile info
- `PUT /api/profiles/:id` - Update profile (parent auth)

### Creators
- `GET /api/profiles/:id/creators` - Get approved creators
- `POST /api/profiles/:id/creators` - Add creator
- `DELETE /api/profiles/:id/creators/:channelId` - Remove creator

### Videos
- `GET /api/profiles/:id/videos` - Get approved videos
- `POST /api/profiles/:id/videos` - Add video
- `DELETE /api/profiles/:id/videos/:videoId` - Remove video
- `POST /api/profiles/:id/videos/:videoId/block` - Block video
- `DELETE /api/profiles/:id/blocked/:videoId` - Unblock video

### History
- `GET /api/profiles/:id/history` - Get watch history (parent auth)
- `POST /api/profiles/:id/history` - Record watch event (kid auth)

## Security Features

- Parent password hashed with bcrypt
- Kid PINs hashed with bcrypt
- JWT tokens for session management (24h for parents, 4h for kids)
- No personal data stored (no real names, emails)
- All YouTube API calls server-side only
- Content filtering at API level

## Customization

### Add More Avatars

Edit `src/lib/constants.js`:
```javascript
export const AVATARS = [
  { id: "rocket", name: "Rocket", emoji: "🚀" },
  // Add more here
];
```

### Add More Silly Names

Edit `src/lib/constants.js`:
```javascript
export const SILLY_NAMES = [
  "Captain Bubbles",
  // Add more here
];
```

### Change Color Scheme

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#8B5CF6',    // Purple
  secondary: '#FBBF24',  // Yellow
  accent: '#F472B6',     // Pink
  background: '#FEF3C7', // Cream
}
```

## Troubleshooting

### Videos Not Loading
- Check YouTube API key is set correctly
- Verify API quota hasn't been exceeded (10,000 units/day)
- Check video isn't blocked or private on YouTube

### Login Issues
- Verify PARENT_PASSWORD_HASH is generated correctly
- Check JWT_SECRET is set
- Clear browser localStorage and try again

### Netlify Functions Not Working
- Ensure `netlify.toml` is configured correctly
- Check function logs in Netlify dashboard
- Verify environment variables are set in Netlify

## License

This project is private and for family use only.

## Contributing

This is a private family project. Feel free to fork for your own family's use!

## Credits

Built with ❤️ for safe, controlled kids' content viewing.
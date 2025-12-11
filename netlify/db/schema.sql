-- KiddoTube Database Schema for Netlify DB (Postgres)

-- Profiles table (replaces profiles blob)
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(50) PRIMARY KEY,
  avatar_id VARCHAR(50) NOT NULL,
  silly_name VARCHAR(100) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approved creators/channels (replaces part of approvals blob)
CREATE TABLE IF NOT EXISTS approved_creators (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id VARCHAR(100) NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  channel_thumbnail TEXT,
  uploads_playlist_id VARCHAR(100),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, channel_id)
);

-- Approved videos (replaces part of approvals blob)
CREATE TABLE IF NOT EXISTS approved_videos (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  thumbnail TEXT,
  channel_name VARCHAR(255),
  channel_id VARCHAR(100),
  duration VARCHAR(50),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(20) DEFAULT 'manual', -- 'manual' or 'creator'
  creator_id INTEGER REFERENCES approved_creators(id) ON DELETE SET NULL,
  UNIQUE(profile_id, video_id)
);

-- Blocked videos (replaces part of approvals blob)
CREATE TABLE IF NOT EXISTS blocked_videos (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id VARCHAR(100) NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, video_id)
);

-- Watch history (replaces history blob)
CREATE TABLE IF NOT EXISTS watch_history (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id VARCHAR(100) NOT NULL,
  watch_duration INTEGER, -- in seconds
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Config table (replaces config blob)
CREATE TABLE IF NOT EXISTS app_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_approved_videos_profile ON approved_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_approved_creators_profile ON approved_creators(profile_id);
CREATE INDEX IF NOT EXISTS idx_blocked_videos_profile ON blocked_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC);

-- Insert default profiles
INSERT INTO profiles (id, avatar_id, silly_name, pin_hash)
VALUES
  ('profile_1', 'rocket', 'Captain Bubbles', ''),
  ('profile_2', 'dinosaur', 'Professor Giggles', '')
ON CONFLICT (id) DO NOTHING;

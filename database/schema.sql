-- KiddoTube Database Schema

-- Profiles table - stores kid profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  avatar_id TEXT NOT NULL,
  silly_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approved creators table - stores approved YouTube channels per profile
CREATE TABLE IF NOT EXISTS approved_creators (
  id SERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  channel_thumbnail TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, channel_id)
);

-- Approved videos table - stores individually approved videos per profile
CREATE TABLE IF NOT EXISTS approved_videos (
  id SERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT,
  video_description TEXT,
  channel_title TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, video_id)
);

-- Blocked videos table - stores videos that are explicitly blocked
CREATE TABLE IF NOT EXISTS blocked_videos (
  id SERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, video_id)
);

-- Watch history table - stores viewing history per profile
CREATE TABLE IF NOT EXISTS watch_history (
  id SERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  watch_duration INTEGER, -- in seconds
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_approved_creators_profile ON approved_creators(profile_id);
CREATE INDEX IF NOT EXISTS idx_approved_videos_profile ON approved_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_blocked_videos_profile ON blocked_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at);

-- Insert default profiles
INSERT INTO profiles (id, avatar_id, silly_name)
VALUES
  ('profile_1', 'rocket', 'Captain Bubbles'),
  ('profile_2', 'dinosaur', 'Professor Giggles')
ON CONFLICT (id) DO NOTHING;

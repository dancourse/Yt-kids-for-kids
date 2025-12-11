// Database utilities using Netlify DB (Neon Postgres)
import { neon } from '@netlify/neon';

// Get SQL client - automatically uses NETLIFY_DATABASE_URL env variable
export function getSQL() {
  return neon();
}

// Initialize database with schema
export async function initializeDatabase() {
  const sql = getSQL();

  try {
    // Check if profiles table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'profiles'
      );
    `;

    if (!result[0].exists) {
      console.log('Database tables do not exist. Please run schema.sql to initialize.');
      // In production, you might want to auto-run the schema here
      // For now, we'll assume it's been set up via Netlify CLI
    }

    return true;
  } catch (error) {
    console.error('Database initialization check failed:', error);
    throw error;
  }
}

// Profile operations
export async function getProfiles() {
  const sql = getSQL();
  const profiles = await sql`
    SELECT id, avatar_id, silly_name, pin_hash, created_at
    FROM profiles
    ORDER BY id
  `;
  return profiles;
}

export async function getProfile(profileId) {
  const sql = getSQL();
  const [profile] = await sql`
    SELECT id, avatar_id, silly_name, pin_hash, created_at
    FROM profiles
    WHERE id = ${profileId}
  `;
  return profile || null;
}

export async function updateProfile(profileId, data) {
  const sql = getSQL();
  const { avatarId, sillyName, pinHash } = data;

  const [updated] = await sql`
    UPDATE profiles
    SET
      avatar_id = COALESCE(${avatarId}, avatar_id),
      silly_name = COALESCE(${sillyName}, silly_name),
      pin_hash = COALESCE(${pinHash}, pin_hash),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${profileId}
    RETURNING *
  `;

  return updated;
}

// Creator operations
export async function getApprovedCreators(profileId) {
  const sql = getSQL();
  const creators = await sql`
    SELECT
      id, channel_id, channel_name, channel_thumbnail,
      uploads_playlist_id, added_at
    FROM approved_creators
    WHERE profile_id = ${profileId}
    ORDER BY added_at DESC
  `;
  return creators;
}

export async function addApprovedCreator(profileId, creatorData) {
  const sql = getSQL();
  const { channelId, channelName, channelThumbnail, uploadsPlaylistId } = creatorData;

  const [creator] = await sql`
    INSERT INTO approved_creators
      (profile_id, channel_id, channel_name, channel_thumbnail, uploads_playlist_id)
    VALUES
      (${profileId}, ${channelId}, ${channelName}, ${channelThumbnail}, ${uploadsPlaylistId})
    ON CONFLICT (profile_id, channel_id) DO NOTHING
    RETURNING *
  `;

  return creator;
}

export async function removeApprovedCreator(profileId, channelId) {
  const sql = getSQL();

  await sql`
    DELETE FROM approved_creators
    WHERE profile_id = ${profileId} AND channel_id = ${channelId}
  `;

  return true;
}

// Video operations
export async function getApprovedVideos(profileId) {
  const sql = getSQL();

  // Get all approved videos that are NOT blocked
  const videos = await sql`
    SELECT
      v.id, v.video_id, v.title, v.thumbnail,
      v.channel_name, v.channel_id, v.duration,
      v.added_at, v.source
    FROM approved_videos v
    WHERE v.profile_id = ${profileId}
    AND NOT EXISTS (
      SELECT 1 FROM blocked_videos b
      WHERE b.profile_id = ${profileId}
      AND b.video_id = v.video_id
    )
    ORDER BY v.added_at DESC
  `;

  return videos;
}

export async function addApprovedVideo(profileId, videoData) {
  const sql = getSQL();
  const { videoId, title, thumbnail, channelName, channelId, duration, source = 'manual' } = videoData;

  const [video] = await sql`
    INSERT INTO approved_videos
      (profile_id, video_id, title, thumbnail, channel_name, channel_id, duration, source)
    VALUES
      (${profileId}, ${videoId}, ${title}, ${thumbnail}, ${channelName}, ${channelId}, ${duration}, ${source})
    ON CONFLICT (profile_id, video_id) DO NOTHING
    RETURNING *
  `;

  return video;
}

export async function removeApprovedVideo(profileId, videoId) {
  const sql = getSQL();

  await sql`
    DELETE FROM approved_videos
    WHERE profile_id = ${profileId} AND video_id = ${videoId}
  `;

  return true;
}

export async function videoExists(profileId, videoId) {
  const sql = getSQL();

  const [result] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM approved_videos
      WHERE profile_id = ${profileId} AND video_id = ${videoId}
    )
  `;

  return result.exists;
}

// Blocked videos operations
export async function getBlockedVideos(profileId) {
  const sql = getSQL();

  const videos = await sql`
    SELECT video_id, reason, blocked_at
    FROM blocked_videos
    WHERE profile_id = ${profileId}
    ORDER BY blocked_at DESC
  `;

  return videos;
}

export async function blockVideo(profileId, videoId, reason = null) {
  const sql = getSQL();

  const [blocked] = await sql`
    INSERT INTO blocked_videos (profile_id, video_id, reason)
    VALUES (${profileId}, ${videoId}, ${reason})
    ON CONFLICT (profile_id, video_id) DO UPDATE
    SET reason = ${reason}, blocked_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return blocked;
}

export async function unblockVideo(profileId, videoId) {
  const sql = getSQL();

  await sql`
    DELETE FROM blocked_videos
    WHERE profile_id = ${profileId} AND video_id = ${videoId}
  `;

  return true;
}

// Watch history operations
export async function getWatchHistory(profileId, limit = 100) {
  const sql = getSQL();

  const history = await sql`
    SELECT video_id, watch_duration, watched_at
    FROM watch_history
    WHERE profile_id = ${profileId}
    ORDER BY watched_at DESC
    LIMIT ${limit}
  `;

  return history;
}

export async function recordWatch(profileId, videoId, watchDuration) {
  const sql = getSQL();

  const [watch] = await sql`
    INSERT INTO watch_history (profile_id, video_id, watch_duration)
    VALUES (${profileId}, ${videoId}, ${watchDuration})
    RETURNING *
  `;

  return watch;
}

// Config operations
export async function getConfig(key) {
  const sql = getSQL();

  const [config] = await sql`
    SELECT value FROM app_config WHERE key = ${key}
  `;

  return config?.value || null;
}

export async function setConfig(key, value) {
  const sql = getSQL();

  await sql`
    INSERT INTO app_config (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE
    SET value = ${value}, updated_at = CURRENT_TIMESTAMP
  `;

  return true;
}

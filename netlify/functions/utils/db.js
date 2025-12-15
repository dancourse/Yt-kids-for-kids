import pg from 'pg';

const { Pool } = pg;

let pool;

// Get database connection pool
export function getPool() {
  if (!pool) {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      },
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

// Execute a query
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error: error.message });
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient() {
  const pool = getPool();
  return await pool.connect();
}

// Profiles
export async function getProfiles() {
  const result = await query(
    'SELECT id, avatar_id as "avatarId", silly_name as "sillyName", created_at as "createdAt" FROM profiles ORDER BY created_at'
  );
  return result.rows;
}

export async function getProfile(profileId) {
  const result = await query(
    'SELECT id, avatar_id as "avatarId", silly_name as "sillyName", created_at as "createdAt" FROM profiles WHERE id = $1',
    [profileId]
  );
  return result.rows[0] || null;
}

// Approved Creators
export async function getApprovedCreators(profileId) {
  const result = await query(
    `SELECT channel_id as "channelId", channel_title as "channelTitle",
            channel_thumbnail as "channelThumbnail", added_at as "addedAt"
     FROM approved_creators
     WHERE profile_id = $1
     ORDER BY added_at DESC`,
    [profileId]
  );
  return result.rows;
}

export async function addApprovedCreator(profileId, creator) {
  const result = await query(
    `INSERT INTO approved_creators (profile_id, channel_id, channel_title, channel_thumbnail)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (profile_id, channel_id) DO NOTHING
     RETURNING channel_id as "channelId", channel_title as "channelTitle",
               channel_thumbnail as "channelThumbnail", added_at as "addedAt"`,
    [profileId, creator.channelId, creator.channelTitle, creator.channelThumbnail]
  );
  return result.rows[0];
}

export async function removeApprovedCreator(profileId, channelId) {
  await query(
    'DELETE FROM approved_creators WHERE profile_id = $1 AND channel_id = $2',
    [profileId, channelId]
  );
}

// Approved Videos
export async function getApprovedVideos(profileId) {
  const result = await query(
    `SELECT video_id as "videoId", video_title as "videoTitle",
            video_thumbnail as "videoThumbnail", video_description as "videoDescription",
            channel_title as "channelTitle", added_at as "addedAt"
     FROM approved_videos
     WHERE profile_id = $1
     ORDER BY added_at DESC`,
    [profileId]
  );
  return result.rows;
}

export async function addApprovedVideo(profileId, video) {
  const result = await query(
    `INSERT INTO approved_videos (profile_id, video_id, video_title, video_thumbnail, video_description, channel_title)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (profile_id, video_id) DO NOTHING
     RETURNING video_id as "videoId", video_title as "videoTitle",
               video_thumbnail as "videoThumbnail", video_description as "videoDescription",
               channel_title as "channelTitle", added_at as "addedAt"`,
    [profileId, video.videoId, video.videoTitle, video.videoThumbnail, video.videoDescription, video.channelTitle]
  );
  return result.rows[0];
}

export async function removeApprovedVideo(profileId, videoId) {
  await query(
    'DELETE FROM approved_videos WHERE profile_id = $1 AND video_id = $2',
    [profileId, videoId]
  );
}

// Blocked Videos
export async function getBlockedVideos(profileId) {
  const result = await query(
    `SELECT video_id as "videoId", reason, blocked_at as "blockedAt"
     FROM blocked_videos
     WHERE profile_id = $1
     ORDER BY blocked_at DESC`,
    [profileId]
  );
  return result.rows;
}

export async function blockVideo(profileId, videoId, reason) {
  const result = await query(
    `INSERT INTO blocked_videos (profile_id, video_id, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (profile_id, video_id) DO UPDATE SET reason = $3, blocked_at = CURRENT_TIMESTAMP
     RETURNING video_id as "videoId", reason, blocked_at as "blockedAt"`,
    [profileId, videoId, reason]
  );
  return result.rows[0];
}

export async function unblockVideo(profileId, videoId) {
  await query(
    'DELETE FROM blocked_videos WHERE profile_id = $1 AND video_id = $2',
    [profileId, videoId]
  );
}

// Watch History
export async function getWatchHistory(profileId, limit = 50) {
  const result = await query(
    `SELECT video_id as "videoId", video_title as "videoTitle",
            watch_duration as "watchDuration", watched_at as "watchedAt"
     FROM watch_history
     WHERE profile_id = $1
     ORDER BY watched_at DESC
     LIMIT $2`,
    [profileId, limit]
  );
  return result.rows;
}

export async function recordWatch(profileId, videoId, videoTitle, watchDuration) {
  const result = await query(
    `INSERT INTO watch_history (profile_id, video_id, video_title, watch_duration)
     VALUES ($1, $2, $3, $4)
     RETURNING video_id as "videoId", video_title as "videoTitle",
               watch_duration as "watchDuration", watched_at as "watchedAt"`,
    [profileId, videoId, videoTitle, watchDuration]
  );
  return result.rows[0];
}

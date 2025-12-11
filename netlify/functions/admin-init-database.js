// ONE-TIME ADMIN ENDPOINT: Initialize database schema
// Visit this endpoint once after deployment to create all tables
// DELETE THIS FILE after running it once!

import { neon } from '@netlify/neon';
import { successResponse, errorResponse } from './utils/response.js';

export async function handler(event) {
  try {
    console.log('🚀 Starting database initialization...');

    const sql = neon();

    // Define the schema inline (from schema.sql)
    const schemaStatements = [
      // Profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(50) PRIMARY KEY,
        avatar_id VARCHAR(50) NOT NULL,
        silly_name VARCHAR(100) NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Approved creators
      `CREATE TABLE IF NOT EXISTS approved_creators (
        id SERIAL PRIMARY KEY,
        profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        channel_id VARCHAR(100) NOT NULL,
        channel_name VARCHAR(255) NOT NULL,
        channel_thumbnail TEXT,
        uploads_playlist_id VARCHAR(100),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, channel_id)
      )`,

      // Approved videos
      `CREATE TABLE IF NOT EXISTS approved_videos (
        id SERIAL PRIMARY KEY,
        profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        video_id VARCHAR(100) NOT NULL,
        title VARCHAR(500) NOT NULL,
        thumbnail TEXT,
        channel_name VARCHAR(255),
        channel_id VARCHAR(100),
        duration VARCHAR(50),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(20) DEFAULT 'manual',
        creator_id INTEGER REFERENCES approved_creators(id) ON DELETE SET NULL,
        UNIQUE(profile_id, video_id)
      )`,

      // Blocked videos
      `CREATE TABLE IF NOT EXISTS blocked_videos (
        id SERIAL PRIMARY KEY,
        profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        video_id VARCHAR(100) NOT NULL,
        reason TEXT,
        blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, video_id)
      )`,

      // Watch history
      `CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        profile_id VARCHAR(50) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        video_id VARCHAR(100) NOT NULL,
        watch_duration INTEGER,
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Config table
      `CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_approved_videos_profile ON approved_videos(profile_id)`,
      `CREATE INDEX IF NOT EXISTS idx_approved_creators_profile ON approved_creators(profile_id)`,
      `CREATE INDEX IF NOT EXISTS idx_blocked_videos_profile ON blocked_videos(profile_id)`,
      `CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON watch_history(profile_id)`,
      `CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC)`,

      // Insert default profiles
      `INSERT INTO profiles (id, avatar_id, silly_name, pin_hash)
       VALUES ('profile_1', 'rocket', 'Captain Bubbles', ''),
              ('profile_2', 'dinosaur', 'Professor Giggles', '')
       ON CONFLICT (id) DO NOTHING`
    ];

    const results = [];

    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      console.log(`Executing statement ${i + 1}/${schemaStatements.length}...`);

      try {
        await sql(statement);
        results.push({
          statement: i + 1,
          status: 'success',
          preview: statement.substring(0, 50) + '...'
        });
      } catch (error) {
        console.warn(`Statement ${i + 1} warning:`, error.message);
        results.push({
          statement: i + 1,
          status: 'warning',
          message: error.message,
          preview: statement.substring(0, 50) + '...'
        });
      }
    }

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = tables.map(t => t.table_name);

    // Check profiles
    const profiles = await sql`SELECT id, silly_name FROM profiles`;

    console.log('✅ Database initialization complete!');

    return successResponse({
      status: 'initialized',
      message: '✅ Database initialized successfully!',
      tablesCreated: tableNames,
      profilesCreated: profiles.map(p => ({ id: p.id, sillyName: p.silly_name })),
      executionResults: results,
      nextSteps: [
        '1. Test the connection: /api/test-db-connection',
        '2. DELETE this admin-init-database.js file (you only need to run this once)',
        '3. Start using the database endpoints!'
      ]
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);

    return errorResponse({
      status: 'failed',
      message: 'Database initialization failed',
      error: error.message,
      stack: error.stack,
      hint: 'Check that NETLIFY_DATABASE_URL is set in environment variables'
    }, 500);
  }
}

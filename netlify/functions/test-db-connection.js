// Simple test endpoint to verify Netlify DB connection
import { neon } from '@netlify/neon';
import { successResponse, errorResponse } from './utils/response.js';

export async function handler(event) {
  try {
    console.log('Testing database connection...');

    // Create SQL client
    const sql = neon();

    // Test 1: Simple query
    const [result] = await sql`SELECT NOW() as current_time, version() as postgres_version`;

    console.log('Database connection successful!');
    console.log('Current time:', result.current_time);
    console.log('Postgres version:', result.postgres_version);

    // Test 2: Check if our tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = tables.map(t => t.table_name);

    // Test 3: Try to count profiles (if table exists)
    let profileCount = 0;
    if (tableNames.includes('profiles')) {
      const [count] = await sql`SELECT COUNT(*) as count FROM profiles`;
      profileCount = parseInt(count.count);
    }

    return successResponse({
      status: 'connected',
      message: 'Database connection successful!',
      details: {
        currentTime: result.current_time,
        postgresVersion: result.postgres_version,
        tablesFound: tableNames,
        profileCount: profileCount,
        schemaInitialized: tableNames.includes('profiles')
      }
    });

  } catch (error) {
    console.error('Database connection failed:', error);

    return errorResponse({
      status: 'failed',
      message: 'Database connection failed',
      error: error.message,
      hint: 'Make sure NETLIFY_DATABASE_URL environment variable is set'
    }, 500);
  }
}

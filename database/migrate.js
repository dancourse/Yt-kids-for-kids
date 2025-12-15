import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ NETLIFY_DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('🔄 Running migrations...');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - profiles');
    console.log('  - approved_creators');
    console.log('  - approved_videos');
    console.log('  - blocked_videos');
    console.log('  - watch_history');
    console.log('\nDefault profiles inserted:');
    console.log('  - profile_1: Captain Bubbles 🚀');
    console.log('  - profile_2: Professor Giggles 🦕');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

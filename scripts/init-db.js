// Script to initialize the database schema
// Run with: node scripts/init-db.js

import { neon } from '@netlify/neon';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('Initializing Netlify DB...');

    // Check for environment variable
    if (!process.env.NETLIFY_DATABASE_URL) {
      console.error('❌ Error: NETLIFY_DATABASE_URL environment variable is not set');
      console.log('\nPlease set it in your .env file or Netlify dashboard');
      process.exit(1);
    }

    // Create SQL client
    const sql = neon();

    // Read schema file
    const schemaPath = path.join(__dirname, '../netlify/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Running schema.sql...');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`  Executing statement ${i + 1}/${statements.length}...`);
        try {
          // Use unsafe query for DDL statements
          await sql(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.warn(`  ⚠️  Warning on statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('✅ Schema initialized successfully!');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📊 Tables in database:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check profiles
    const profiles = await sql`SELECT id, silly_name FROM profiles`;
    console.log('\n👤 Profiles in database:');
    profiles.forEach(p => console.log(`  - ${p.id}: ${p.silly_name}`));

    console.log('\n✨ Database is ready to use!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

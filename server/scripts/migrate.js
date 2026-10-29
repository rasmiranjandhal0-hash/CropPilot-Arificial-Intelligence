import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;

async function runMigration() {
  console.log('🔄 ChatPilot Database Migration Runner\n');

  if (!databaseUrl || databaseUrl.includes('postgres:[password]@db.[project-ref]')) {
    console.error('❌ Error: DATABASE_URL is not configured in server/.env');
    console.log('\nTo run migrations directly:');
    console.log('1. Go to your Supabase project dashboard -> Settings -> Database');
    console.log('2. Copy the "Connection string (URI)" (Session or Direct mode)');
    console.log('3. Set DATABASE_URL in server/.env with your database password');
    console.log('4. Alternatively, you can copy the contents of supabase/migrations/001_initial_schema.sql');
    console.log('   and run it in the Supabase SQL Editor.\n');
    process.exit(1);
  }

  const migrationPath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📡 Connecting to PostgreSQL at ${databaseUrl.replace(/:[^:@]+@/, ':****@')}...`);
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    console.log('🚀 Executing migration 001_initial_schema.sql...');
    await client.query(sqlContent);
    console.log('✅ Migration executed successfully!');

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('conversations', 'messages')
    `);

    console.log('\n📊 Tables verified in public schema:');
    res.rows.forEach((r) => console.log(`   - ${r.table_name}`));
    console.log('\n🎉 Database setup complete!\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

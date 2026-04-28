// Migration script to execute SQL schema on Supabase
const fs = require('fs');
const path = require('path');

// Clear any existing DATABASE_URL from environment
delete process.env.DATABASE_URL;

// Load only the .env.local file
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import db module AFTER dotenv is configured
const { pool, query } = require('../src/db');

async function runMigration() {
  console.log('🚀 Starting database migration to Supabase...');
  
  // Debug: Check environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment');
    console.error('   .env.local path:', path.join(__dirname, '../.env.local'));
    process.exit(1);
  }
  
  // Show partial connection string for verification (hide password)
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`📌 Using DATABASE_URL: ${maskedUrl}`);
  
  try {
    // Test connection first
    console.log('📡 Testing database connection...');
    const testResult = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connected to PostgreSQL');
    console.log(`   Time: ${testResult.rows[0].current_time}`);
    console.log(`   Version: ${testResult.rows[0].pg_version.split(' ').slice(0, 2).join(' ')}`);
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, '../../Database/supabase-schema.sql');
    console.log(`\n📂 Reading schema from: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`   File size: ${(schemaSql.length / 1024).toFixed(2)} KB`);
    
    // Execute the schema
    console.log('\n⚙️  Executing schema...');
    await query(schemaSql);
    console.log('✅ Schema executed successfully');
    
    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    
    process.exit(1);
  }
}

// Run the migration
runMigration();

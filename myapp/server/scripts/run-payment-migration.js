const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function runMigration() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected');
    
    // Read and execute migration
    const sqlFile = path.resolve(__dirname, '../Database/migrations/V9__payment_logs.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✓ Payment logs table created successfully');
    console.log('✓ Indexes created');
    console.log('✓ Views created');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration error:', error);
    console.error('Details:', error.message, error.code, error.detail);
    await pool.end();
    process.exit(1);
  }
}

runMigration();

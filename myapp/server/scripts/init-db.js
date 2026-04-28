/**
 * Database Initialization Script
 * Checks if tables exist and creates them if needed
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTableExists(tableName) {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

async function runSQLFile(filePath) {
  console.log(`\nRunning ${path.basename(filePath)}...`);
  const sql = await fs.readFile(filePath, 'utf8');
  
  try {
    await pool.query(sql);
    console.log(`✓ ${path.basename(filePath)} executed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error running ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function initDatabase() {
  console.log('=== Database Initialization ===\n');
  console.log('Checking database connection...');
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Check if main tables exist
  console.log('Checking existing tables...');
  const tables = ['customer_user', 'product', 'inventory', 'cart', 'orders'];
  const existingTables = [];
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (exists) {
      existingTables.push(table);
    }
  }
  
  if (existingTables.length > 0) {
    console.log(`\nFound existing tables: ${existingTables.join(', ')}`);
    console.log('\nDatabase appears to be already initialized.');
    console.log('If you want to reset the database, run the migration files manually.');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\nDo you want to drop and recreate all tables? (yes/no): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\nInitialization cancelled.');
      await pool.end();
      process.exit(0);
    }
  }
  
  // Run schema initialization
  const migrationsDir = path.join(__dirname, '..', '..', 'Database', 'migrations');
  
  console.log('\nRunning database migrations...');
  
  // V1: Initial schema
  const v1Path = path.join(migrationsDir, 'V1__init_schema.sql');
  if (await fs.access(v1Path).then(() => true).catch(() => false)) {
    await runSQLFile(v1Path);
  } else {
    console.log('⚠ V1__init_schema.sql not found, skipping...');
  }
  
  console.log('\n=== Initialization Complete ===');
  console.log('\nNext steps:');
  console.log('1. Run "npm run db:seed" to add sample data');
  console.log('2. Start the server with "npm run dev"\n');
  
  await pool.end();
}

// Run initialization
initDatabase().catch(error => {
  console.error('\n✗ Initialization failed:', error);
  process.exit(1);
});

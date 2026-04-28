/**
 * Database Seeding Script
 * Populates database with sample data for development
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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

async function seedDatabase() {
  console.log('=== Database Seeding ===\n');
  console.log('Checking database connection...');
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Check if data already exists
  const result = await pool.query('SELECT COUNT(*) FROM product');
  const productCount = parseInt(result.rows[0].count);
  
  if (productCount > 0) {
    console.log(`Found ${productCount} existing products in database.`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\nDo you want to delete existing data and reseed? (yes/no): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\nSeeding cancelled.');
      await pool.end();
      process.exit(0);
    }
    
    // Clear existing data
    console.log('\nClearing existing data...');
    await pool.query('TRUNCATE TABLE product, category, customer_user, cart, orders CASCADE');
    console.log('✓ Existing data cleared');
  }
  
  // Run seed files
  const migrationsDir = path.join(__dirname, '..', '..', 'Database', 'migrations');
  
  console.log('\nRunning seed data...');
  
  // V2: Seed data
  const v2Path = path.join(migrationsDir, 'V2__seed_data.sql');
  if (await fs.access(v2Path).then(() => true).catch(() => false)) {
    await runSQLFile(v2Path);
  } else {
    // Try alternative seed file
    const v5Path = path.join(migrationsDir, 'V5__seed_data.sql');
    if (await fs.access(v5Path).then(() => true).catch(() => false)) {
      await runSQLFile(v5Path);
    } else {
      console.log('⚠ No seed data files found');
    }
  }
  
  // Count records
  console.log('\nVerifying seeded data...');
  const counts = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM product) as products,
      (SELECT COUNT(*) FROM category) as categories,
      (SELECT COUNT(*) FROM customer_user) as users
  `);
  
  const { products, categories, users } = counts.rows[0];
  console.log(`✓ Products: ${products}`);
  console.log(`✓ Categories: ${categories}`);
  console.log(`✓ Users: ${users}`);
  
  console.log('\n=== Seeding Complete ===');
  console.log('\nYou can now start the server with "npm run dev"\n');
  
  await pool.end();
}

// Run seeding
seedDatabase().catch(error => {
  console.error('\n✗ Seeding failed:', error);
  process.exit(1);
});

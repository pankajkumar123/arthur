require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('========================================');
    console.log('  Database Connection Test');
    console.log('========================================\n');
    
    console.log('Configuration:');
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}\n`);
    
    if (!process.env.DATABASE_URL) {
      console.error('✗ ERROR: DATABASE_URL is not set in .env file');
      process.exit(1);
    }
    
    console.log('Testing connection...');
    const client = await pool.connect();
    console.log('✓ Connected to database successfully!\n');
    
    // Test query - get current timestamp
    const timeResult = await client.query('SELECT NOW()');
    console.log('✓ Database server time:', timeResult.rows[0].now);
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('✓ PostgreSQL version:', versionResult.rows[0].version.split(',')[0]);
    
    // Check if required tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n✓ Available tables:');
    if (tables.rows.length === 0) {
      console.log('  ⚠ No tables found - database may need initialization');
    } else {
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    }
    
    // Check required tables
    const requiredTables = ['users', 'products', 'cart', 'orders', 'order_items', 'rfq', 'rfq_items'];
    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n⚠ Missing required tables:');
      missingTables.forEach(table => console.log(`  - ${table}`));
      console.log('\n  Run database schema setup script to create missing tables.');
    } else {
      console.log('\n✓ All required tables exist!');
    }
    
    // Get row counts
    console.log('\nTable Statistics:');
    for (const table of existingTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${countResult.rows[0].count} rows`);
      } catch (err) {
        console.log(`  ${table}: Unable to count (${err.message})`);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('\n========================================');
    console.log('✓ Connection test completed successfully!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('✗ Database Connection Error');
    console.error('========================================');
    console.error('\nError Details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    
    console.error('\nTroubleshooting:');
    console.error('  1. Verify DATABASE_URL is set correctly in .env file');
    console.error('  2. Check database credentials (username, password)');
    console.error('  3. Ensure database server is running and accessible');
    console.error('  4. Check firewall settings allow database connections');
    console.error('  5. For SSL errors, verify SSL configuration in connection string');
    console.error('\n');
    
    process.exit(1);
  }
}

testConnection();

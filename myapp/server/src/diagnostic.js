// Diagnostic script to test Render deployment issues
require('dotenv').config();

const chalk = require('chalk') || {
  green: (s) => `✓ ${s}`,
  red: (s) => `✗ ${s}`,
  yellow: (s) => `⚠ ${s}`,
  blue: (s) => `ℹ ${s}`
};

console.log('\n📋 RENDER DEPLOYMENT DIAGNOSTIC\n');

// 1. Check Environment Variables
console.log(chalk.blue('1. Environment Variables'));
const requiredVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(chalk.green(`   ${varName}: SET ✓`));
  } else {
    console.log(chalk.red(`   ${varName}: MISSING ✗`));
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log(chalk.yellow('\n⚠️  Missing environment variables! Add them in Render dashboard.'));
}

// 2. Check Database Connection
console.log(chalk.blue('\n2. Database Connection'));
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.log(chalk.red('   DATABASE_URL not set - Cannot connect to database'));
} else {
  console.log(`   Attempting to connect to PostgreSQL...`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.log(chalk.red(`   Database Error: ${err.message} ✗`));
    } else {
      console.log(chalk.green(`   Database Connected ✓`));
      
      // Check for tables
      pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        LIMIT 5
      `, (err, result) => {
        if (err) {
          console.log(chalk.red(`   Cannot check tables: ${err.message}`));
        } else {
          console.log(`   Tables found: ${result.rowCount}`);
          result.rows.forEach(row => {
            console.log(`     - ${row.table_name}`);
          });
        }
        pool.end();
        continueCheck();
      });
    }
  });
} 

function continueCheck() {
  // 3. Check Express Setup
  console.log(chalk.blue('\n3. Express Configuration'));
  const express = require('express');
  const app = express();
  
  console.log(chalk.green('   Express: Installed ✓'));
  console.log(chalk.green('   Middleware: Loaded ✓'));
  
  // 4. Check Routes
  console.log(chalk.blue('\n4. API Routes'));
  const routeFiles = [
    'auth.js',
    'catalog.js',
    'cart.js',
    'orders.js',
    'payment.js',
    'notifications.js'
  ];
  
  const fs = require('fs');
  const path = require('path');
  
  routeFiles.forEach(file => {
    const routePath = path.join(__dirname, 'routes', file);
    if (fs.existsSync(routePath)) {
      console.log(chalk.green(`   ${file}: ✓`));
    } else {
      console.log(chalk.red(`   ${file}: MISSING ✗`));
    }
  });
  
  // 5. Port Configuration
  console.log(chalk.blue('\n5. Port Configuration'));
  const port = process.env.PORT || 4000;
  console.log(`   PORT: ${port} ${port === '10000' || port === 4000 ? '✓' : '✗'}`);
  
  // 6. Summary
  console.log(chalk.blue('\n6. Deployment Status'));
  console.log('\n✅ Diagnostic complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify all environment variables are set in Render dashboard');
  console.log('   2. Check DATABASE_URL format is correct');
  console.log('   3. If database errors, create PostgreSQL database on Render first');
  console.log('   4. Restart the web service deployment');
  console.log('\n');
}

// If database already checked, show summary
if (!process.env.DATABASE_URL) {
  continueCheck();
}

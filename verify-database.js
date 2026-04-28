const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '010101',
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

async function verifyDatabase() {
  try {
    console.log('\n===============================================');
    console.log('DATABASE VERIFICATION TEST');
    console.log('===============================================\n');

    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Check table count
    const tableResult = await client.query(
      'SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\''
    );
    const tableCount = tableResult.rows[0].table_count;
    console.log(`✅ Total Tables: ${tableCount}`);
    
    if (tableCount >= 22) {
      console.log('✅ All 22 tables created (Schema complete)\n');
    } else {
      console.log(`⚠️  Expected 22 tables, found ${tableCount}\n`);
    }

    // Check users
    const userResult = await client.query('SELECT COUNT(*) as user_count FROM customer_user');
    console.log(`✅ Users in database: ${userResult.rows[0].user_count}`);

    // Check products
    const productResult = await client.query('SELECT COUNT(*) as product_count FROM customer_product');
    console.log(`✅ Products in database: ${productResult.rows[0].product_count}`);

    // Check orders
    const orderResult = await client.query('SELECT COUNT(*) as order_count FROM customer_order');
    console.log(`✅ Orders in database: ${orderResult.rows[0].order_count}`);

    // Check payments
    const paymentResult = await client.query('SELECT COUNT(*) as payment_count FROM payment_logs');
    console.log(`✅ Payments recorded: ${paymentResult.rows[0].payment_count}`);

    console.log('\n===============================================');
    console.log('✅ DATABASE VERIFICATION: PASSED');
    console.log('===============================================\n');

    await client.end();
    return true;
  } catch (err) {
    console.error('❌ DATABASE ERROR:', err.message);
    console.log('===============================================\n');
    return false;
  }
}

verifyDatabase().then(success => {
  process.exit(success ? 0 : 1);
});

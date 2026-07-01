const { Pool } = require('pg');

// Exact connection string from Supabase dashboard
const DATABASE_URL = 'postgresql://postgres:NCDs8ypxBZXb0jgj@db.lxednjurpshwzaqcfyrp.supabase.co:5432/postgres';

console.log('Testing with:', DATABASE_URL.replace(/:[^:]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to Supabase...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Server time:', result.rows[0].now);

    // Test query admin user
    console.log('\n🔄 Checking admin user...');
    const userResult = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE username = $1',
      ['admin']
    );

    if (userResult.rows.length > 0) {
      console.log('✅ Admin user found:');
      console.log(userResult.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }

    await pool.end();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();

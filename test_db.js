const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Uvbuuvbu4366%40@db.lrnajodxfwegimnwnbdd.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function check() {
  try {
    await client.connect();
    
    console.log('--- Columns in profiles table ---');
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    
    if (res.rows.length === 0) {
      console.log('Table profiles DOES NOT EXIST!');
    } else {
      res.rows.forEach(row => {
        console.log(`${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

check();

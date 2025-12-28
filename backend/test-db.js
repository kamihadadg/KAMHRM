// Simple test script to verify database creation
require('dotenv').config();

// Force database creation for testing
process.env.CREATE_DB = 'true';

const { Client } = require('pg');

async function testDatabaseCreation() {
  const dbConfig = {
    host: process.env.DB_HOST || '192.168.1.112',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'dev_user',
    password: process.env.DB_PASSWORD || 'dev_pass',
    database: 'postgres',
  };

  const targetDatabase = process.env.DB_NAME || 'kamhrm';

  let client = null;

  try {
    console.log('🔍 Testing database connection and creation...');
    console.log(`📍 Connecting to PostgreSQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);

    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully');

    // Check if database exists
    const result = await client.query(
      'SELECT datname FROM pg_catalog.pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (result.rows.length === 0) {
      console.log(`📦 Database '${targetDatabase}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${targetDatabase}"`);
      console.log(`✅ Database '${targetDatabase}' created successfully!`);
    } else {
      console.log(`✅ Database '${targetDatabase}' already exists.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Make sure:');
    console.error('   - PostgreSQL server is running');
    console.error('   - Database credentials are correct');
    console.error('   - User has CREATE DATABASE permissions');
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testDatabaseCreation();

import { Client } from 'pg';

export async function createDatabaseIfNotExists(): Promise<void> {
  // Only create database if explicitly requested
  if (process.env.CREATE_DB !== 'true') {
    console.log('⏭️  Database creation skipped (set CREATE_DB=true to create)');
    return;
  }
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'dev_user',
    password: process.env.DB_PASSWORD || 'dev_pass',
    database: 'postgres', // Connect to default postgres database
  };

  const targetDatabase = process.env.DB_NAME || 'kamhrm';

  let client: Client | null = null;

  try {
    console.log('🔍 Checking if database exists...');
    console.log(`📍 Connecting to PostgreSQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);

    // Connect to postgres database to check/create target database
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

      // Create the database
      await client.query(`CREATE DATABASE "${targetDatabase}"`);

      console.log(`✅ Database '${targetDatabase}' created successfully!`);
      console.log(`🔄 Waiting 2 seconds for database to be ready...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`✅ Database '${targetDatabase}' already exists.`);
    }

  } catch (error) {
    console.error('❌ Error creating/checking database:', error);
    console.error('💡 Make sure PostgreSQL is running and the user has CREATE DATABASE permissions');
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

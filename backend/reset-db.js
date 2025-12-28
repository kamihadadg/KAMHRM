const sql = require('mssql');

// Database configuration - update these values according to your setup
const config = {
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'password',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'company_portal',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Script to clean up invalid position records
async function cleanupInvalidPositions() {
  console.log('🧹 Starting cleanup of invalid positions...');

  try {
    const pool = await sql.connect(config);

    // Find invalid positions
    const invalidResult = await pool.request().query(`
      SELECT id, title FROM positions
      WHERE LEN(id) != 36 OR id NOT LIKE '[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]'
    `);

    if (invalidResult.recordset.length > 0) {
      console.log('❌ Found invalid positions:', invalidResult.recordset);

      // Delete invalid positions
      for (const pos of invalidResult.recordset) {
        await pool.request()
          .input('id', sql.VarChar, pos.id)
          .query('DELETE FROM positions WHERE id = @id');

        console.log(`🗑️ Deleted invalid position: ${pos.title} (${pos.id})`);
      }

      console.log('✅ Invalid positions cleaned up successfully!');
    } else {
      console.log('✅ No invalid positions found.');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Error cleaning up positions:', error);
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);

    const dbName = config.database;
    console.log(`📝 Resetting database: ${dbName}`);

    // Drop database if exists and recreate
    await sql.query(`
      IF EXISTS (SELECT name FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${dbName}];
      END
    `);

    console.log('✅ Database dropped successfully');

    await sql.query(`CREATE DATABASE [${dbName}]`);
    console.log('✅ Database created successfully');

    console.log('🎉 Database reset complete!');
    console.log('📋 Next steps:');
    console.log('   1. Restart your backend application');
    console.log('   2. The application will auto-create the admin user');
    console.log('   3. You can then create positions and users through the admin panel');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await sql.close();
  }
}

// Run the appropriate function based on command line arguments
if (process.argv[2] === 'cleanup') {
  cleanupInvalidPositions().then(() => {
    console.log('🎉 Cleanup completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
} else {
  resetDatabase().then(() => {
    console.log('🎉 Database reset completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Database reset failed:', error);
    process.exit(1);
  });
}

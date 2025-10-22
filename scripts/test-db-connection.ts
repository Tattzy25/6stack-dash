import { neon } from '@neondatabase/serverless';

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable is missing');
    console.log('   Please check your .env.local file');
    return;
  }
  
  console.log(`📋 Using DATABASE_URL: ${databaseUrl.substring(0, 30)}...`);
  
  try {
    const sql = neon(databaseUrl);
    
    // Simple test query
    const result = await sql`SELECT 1 as test_value`;
    
    console.log('✅ Database connection: SUCCESS');
    console.log(`📊 Test query result: ${JSON.stringify(result)}`);
    
    // Try to list tables
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      console.log('📋 Existing tables in database:');
      if (tables.length === 0) {
        console.log('   No tables found - database may be empty');
      } else {
        tables.forEach((table, index) => {
          console.log(`   ${index + 1}. ${table.table_name}`);
        });
      }
      
    } catch (tableError) {
      console.log('ℹ️  Could not list tables (may not have permissions)');
    }
    
    console.log('\n🎉 Your database connection is working!');
    
  } catch (error) {
    console.error('❌ Database connection failed with error:', error.message);
    console.log('\n🔧 Please check:');
    console.log('   1. DATABASE_URL in .env.local is correct');
    console.log('   2. Neon database is running and accessible');
    console.log('   3. Network connectivity to Neon');
    console.log('   4. Database credentials are valid');
  }
}

testConnection().catch(console.error);
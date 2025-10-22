import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Get database connection string from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a connection pool
const sql = neon(databaseUrl);

// Create Drizzle ORM instance with schema
const db = drizzle({ client: sql, schema });

// Database connection utilities
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database migration utilities
export const runMigrations = async (): Promise<void> => {
  try {
    // Check if tables exist by querying system_config
    const tablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_config'
      );
    `;

    if (!tablesExist[0].exists) {
      console.log('Database schema not found. Running migrations...');
      
      // Import and execute the schema SQL
      const { readFile } = await import('fs/promises');
      const schemaSql = await readFile('database/schema.sql', 'utf-8');
      
      // Split into individual statements and execute
      const statements = schemaSql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await sql(statement);
        }
      }
      
      console.log('Migrations completed successfully');
    } else {
      console.log('Database schema already exists');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Health check endpoint
export const healthCheck = async () => {
  try {
    const connected = await checkDatabaseConnection();
    return {
      status: connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: connected ? 'connected' : 'disconnected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export the database instance and utilities
export { sql, db };
export default db;
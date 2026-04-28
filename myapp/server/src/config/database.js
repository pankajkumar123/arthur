/**
 * Database Configuration
 * Centralizes all database settings
 */

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: process.env.DB_POOL_MAX || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 10000,
  ssl: process.env.DATABASE_URL?.includes('supabase.co') 
    ? { rejectUnauthorized: false } 
    : false
};

module.exports = poolConfig;

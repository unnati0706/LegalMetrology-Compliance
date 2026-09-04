import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'legal-metrology-sih26034-dev-secret-key-32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'legal_metrology_db',
    ssl: process.env.DB_SSL === 'true',
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  },
  ruleEngine: {
    defaultVersion: 'PCR-2011-v2.0',
    confidenceThreshold: 0.75,
  }
};

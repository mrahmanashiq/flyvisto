const dotenv = require('dotenv');
const joi = require('joi');

dotenv.config();

// Configuration validation schema
const configSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().port().default(3000),
  HOST: joi.string().default('localhost'),
  
  // Database
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().port().default(3306),
  DB_NAME: joi.string().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().allow('').default(''),
  DB_DIALECT: joi.string().valid('mysql', 'postgres', 'sqlite', 'mariadb').default('mysql'),
  
  // JWT
  JWT_SECRET: joi.string().min(32).required(),
  JWT_EXPIRES_IN: joi.string().default('24h'),
  JWT_REFRESH_SECRET: joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
  
  // Redis
  REDIS_HOST: joi.string().default('localhost'),
  REDIS_PORT: joi.number().port().default(6379),
  REDIS_PASSWORD: joi.string().allow('').default(''),
  
  // Email
  SMTP_HOST: joi.string().default('smtp.gmail.com'),
  SMTP_PORT: joi.number().port().default(587),
  SMTP_USER: joi.string().email(),
  SMTP_PASSWORD: joi.string(),
  FROM_EMAIL: joi.string().email().default('noreply@flyvisto.com'),
  
  // Payment
  STRIPE_SECRET_KEY: joi.string(),
  STRIPE_PUBLISHABLE_KEY: joi.string(),
  STRIPE_WEBHOOK_SECRET: joi.string(),
  
  // Security
  RATE_LIMIT_WINDOW_MS: joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: joi.number().default(100),
  BCRYPT_SALT_ROUNDS: joi.number().default(12),
  
  // File Upload
  MAX_FILE_SIZE: joi.number().default(5242880), // 5MB
  UPLOAD_PATH: joi.string().default('uploads/'),
  
  // Monitoring
  LOG_LEVEL: joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  SENTRY_DSN: joi.string().uri().allow(''),
});

const { error, value: config } = configSchema.validate(process.env, {
  allowUnknown: true,
  stripUnknown: false,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  ...config,
  
  // Computed values
  isProduction: config.NODE_ENV === 'production',
  isDevelopment: config.NODE_ENV === 'development',
  isTest: config.NODE_ENV === 'test',
  
  // Database URL for easier access
  DATABASE_URL: `${config.DB_DIALECT}://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
};

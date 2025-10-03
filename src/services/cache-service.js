const redis = require('redis');
const { Logger } = require('../config');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            Logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            Logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > this.maxRetries) {
            Logger.error('Redis max retries reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        Logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        Logger.info('Redis client connected');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('ready', () => {
        Logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        Logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
      Logger.info('Redis cache service initialized');
    } catch (error) {
      Logger.error('Failed to connect to Redis', { error: error.message });
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      Logger.info('Redis cache service disconnected');
    }
  }

  async get(key) {
    if (!this.isConnected) {
      Logger.warn('Redis not connected, skipping cache get', { key });
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        Logger.debug('Cache hit', { key });
        return JSON.parse(value);
      }
      Logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      Logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected) {
      Logger.warn('Redis not connected, skipping cache set', { key });
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serializedValue);
      Logger.debug('Cache set', { key, ttl: ttlSeconds });
      return true;
    } catch (error) {
      Logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      Logger.warn('Redis not connected, skipping cache delete', { key });
      return false;
    }

    try {
      await this.client.del(key);
      Logger.debug('Cache delete', { key });
      return true;
    } catch (error) {
      Logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      Logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  async flush() {
    if (!this.isConnected) {
      Logger.warn('Redis not connected, skipping cache flush');
      return false;
    }

    try {
      await this.client.flushAll();
      Logger.info('Cache flushed');
      return true;
    } catch (error) {
      Logger.error('Cache flush error', { error: error.message });
      return false;
    }
  }

  // Cache key generators
  static generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  static generateFlightKey(flightId) {
    return this.generateKey('flight', flightId);
  }

  static generateUserKey(userId) {
    return this.generateKey('user', userId);
  }

  static generateSearchKey(searchParams) {
    const sortedParams = Object.keys(searchParams)
      .sort()
      .map(key => `${key}=${searchParams[key]}`)
      .join('&');
    return this.generateKey('search', Buffer.from(sortedParams).toString('base64'));
  }

  // Cache patterns for common operations
  async cacheFlight(flightId, flightData, ttlSeconds = 1800) {
    const key = CacheService.generateFlightKey(flightId);
    return await this.set(key, flightData, ttlSeconds);
  }

  async getCachedFlight(flightId) {
    const key = CacheService.generateFlightKey(flightId);
    return await this.get(key);
  }

  async cacheUser(userId, userData, ttlSeconds = 3600) {
    const key = CacheService.generateUserKey(userId);
    return await this.set(key, userData, ttlSeconds);
  }

  async getCachedUser(userId) {
    const key = CacheService.generateUserKey(userId);
    return await this.get(key);
  }

  async cacheSearch(searchParams, results, ttlSeconds = 300) {
    const key = CacheService.generateSearchKey(searchParams);
    return await this.set(key, results, ttlSeconds);
  }

  async getCachedSearch(searchParams) {
    const key = CacheService.generateSearchKey(searchParams);
    return await this.get(key);
  }

  // Invalidate related cache entries
  async invalidateUserCache(userId) {
    const userKey = CacheService.generateUserKey(userId);
    await this.del(userKey);
    Logger.info('User cache invalidated', { userId });
  }

  async invalidateFlightCache(flightId) {
    const flightKey = CacheService.generateFlightKey(flightId);
    await this.del(flightKey);
    Logger.info('Flight cache invalidated', { flightId });
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'unhealthy', message: 'Not connected to Redis' };
    }

    try {
      await this.client.ping();
      return { status: 'healthy', message: 'Redis is responding' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;

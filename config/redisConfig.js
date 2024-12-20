import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: 'localhost', // Default Redis host
  port: 6379,        // Default Redis port
});

// Optional: Error Handling
redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export default redis;
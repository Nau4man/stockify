import { Redis } from '@upstash/redis';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 30;

const rateLimitMap = new Map();

const isRedisConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
};

export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    const clientIp = ips[0];
    if (clientIp && /^[\d.:a-fA-F]+$/.test(clientIp)) {
      return clientIp;
    }
  }
  return req.headers['x-real-ip'] || 'unknown';
};

const checkRateLimitInMemory = (ip) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_SECONDS * 1000;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitMap.set(ip, validRequests);

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] + RATE_LIMIT_WINDOW_SECONDS * 1000 - now) / 1000)
    };
  }

  validRequests.push(now);
  return { allowed: true };
};

export const checkRateLimit = async (ip) => {
  if (isRedisConfigured) {
    try {
      const redis = getRedisClient();
      const key = `ratelimit:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
      }

      if (count > RATE_LIMIT_MAX_REQUESTS) {
        const ttl = await redis.ttl(key);
        return {
          allowed: false,
          retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS
        };
      }

      return { allowed: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        return {
          allowed: false,
          errorType: 'config',
          retryAfter: RATE_LIMIT_WINDOW_SECONDS
        };
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    return {
      allowed: false,
      errorType: 'config',
      retryAfter: RATE_LIMIT_WINDOW_SECONDS
    };
  }

  return checkRateLimitInMemory(ip);
};

export const rateLimitConfig = {
  windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: RATE_LIMIT_MAX_REQUESTS
};

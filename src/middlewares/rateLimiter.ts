import express from 'express';
import TokenBucketRateLimiter from './tokenBucketLimiter';

/**
 * TOKEN BUCKET LIMITERS
 */

// General API: 100 requests per 15 minutes
// Calculation: 100 tokens / (15 * 60 seconds) = 0.111 tokens/sec
const generalBucket = new TokenBucketRateLimiter({
  capacity: 100,
  refillRate: 100 / (15 * 60), // tokens per second
});

export const generalLimiterTokenBucket = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const clientId = req.ip || 'unknown';
  const result = generalBucket.isAllowed(clientId);

  // Add rate limit headers
  res.setHeader('RateLimit-Limit', '100');
  res.setHeader('RateLimit-Remaining', result.tokensRemaining);
  res.setHeader(
    'RateLimit-Reset',
    Math.floor(Date.now() / 1000) + result.resetTime
  );

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: result.resetTime,
    });
  }

  next();
};

// Auth: 5 attempts per 15 minutes (stricter)
// Calculation: 5 tokens / (15 * 60 seconds) = 0.0056 tokens/sec
const authBucket = new TokenBucketRateLimiter({
  capacity: 5,
  refillRate: 5 / (15 * 60),
});

export const authLimiterTokenBucket = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const clientId = req.ip || 'unknown';
  const result = authBucket.isAllowed(clientId);

  res.setHeader('RateLimit-Limit', '5');
  res.setHeader('RateLimit-Remaining', result.tokensRemaining);
  res.setHeader(
    'RateLimit-Reset',
    Math.floor(Date.now() / 1000) + result.resetTime
  );

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many login attempts, please try again after 15 minutes.',
      retryAfter: result.resetTime,
    });
  }

  next();
};

// Write ops: 20 per minute (moderate)
// Calculation: 20 tokens / 60 seconds = 0.333 tokens/sec
const writeBucket = new TokenBucketRateLimiter({
  capacity: 20,
  refillRate: 20 / 60,
});

export const writeLimiterTokenBucket = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const clientId = req.ip || 'unknown';
  const result = writeBucket.isAllowed(clientId);

  res.setHeader('RateLimit-Limit', '20');
  res.setHeader('RateLimit-Remaining', result.tokensRemaining);
  res.setHeader(
    'RateLimit-Reset',
    Math.floor(Date.now() / 1000) + result.resetTime
  );

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many write requests, please try again later.',
      retryAfter: result.resetTime,
    });
  }

  next();
};

// Generous Rate limiter
const healthBucket = new TokenBucketRateLimiter({
  capacity: 1000,
  refillRate: 1000 / 60, // 1000 per minute
});

export const healthCheckLimiterTokenBucket = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const clientId = req.ip || 'unknown';
  const result = healthBucket.isAllowed(clientId);

  res.setHeader('RateLimit-Limit', '1000');
  res.setHeader('RateLimit-Remaining', result.tokensRemaining);
  res.setHeader(
    'RateLimit-Reset',
    Math.floor(Date.now() / 1000) + result.resetTime
  );

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many health check requests.',
      retryAfter: result.resetTime,
    });
  }

  next();
};

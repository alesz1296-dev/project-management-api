/**
 * TOKEN BUCKET IMPLEMENTATION
 *
 * Each client gets a "bucket" with N tokens
 * Each request consumes 1 token
 * Tokens refill at a constant rate (tokens per second)
 * If bucket empty → request blocked
 */

interface TokenBucket {
  tokens: number;
  lastRefillTime: number;
}

interface RateLimitConfig {
  capacity: number; // Max tokens in bucket
  refillRate: number; // Tokens per second
  timeWindowMs?: number; // For display/monitoring
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private capacity: number;
  private refillRate: number;

  constructor(config: RateLimitConfig) {
    this.capacity = config.capacity;
    this.refillRate = config.refillRate;
  }

  /**
   * Check if request should be allowed
   */
  isAllowed(clientId: string): {
    allowed: boolean;
    tokensRemaining: number;
    resetTime: number;
  } {
    const now = Date.now();

    // Get or create bucket for this client
    let bucket = this.buckets.get(clientId);
    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefillTime: now,
      };
      this.buckets.set(clientId, bucket);
    }

    // Calculate how many tokens to add since last refill
    const timePassed = (now - bucket.lastRefillTime) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    // Update bucket
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefillTime = now;

    // Check if request is allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      const resetTime = Math.ceil(
        (this.capacity - bucket.tokens) / this.refillRate
      );
      return {
        allowed: true,
        tokensRemaining: Math.floor(bucket.tokens),
        resetTime,
      };
    }

    // Not allowed - calculate when next token will be available
    const timeUntilNextToken = (1 - bucket.tokens) / this.refillRate;
    const resetTime = Math.ceil(timeUntilNextToken * 1000); // convert to milliseconds

    return {
      allowed: false,
      tokensRemaining: 0,
      resetTime,
    };
  }

  /**
   * Reset bucket for a specific client (admin function)
   */
  resetBucket(clientId: string): void {
    this.buckets.delete(clientId);
  }
}

export default TokenBucketRateLimiter;

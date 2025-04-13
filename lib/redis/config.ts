import { Redis } from '@upstash/redis'

/**
 * Redis configuration type definition
 */
export type RedisConfig = {
  upstashRedisRestUrl: string
  upstashRedisRestToken: string
}

/**
 * Redis configuration from environment variables
 */
export const redisConfig: RedisConfig = {
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || '',
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || ''
}

// Singleton instance of RedisWrapper
let redisWrapper: RedisWrapper | null = null

/**
 * Wrapper class for Redis client providing type-safe methods
 * for common Redis operations
 */
export class RedisWrapper {
  private client: Redis

  constructor(client: Redis) {
    this.client = client
  }

  /**
   * Get a range of members from a sorted set
   */
  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    return await this.client.zrange(key, start, stop, options)
  }

  /**
   * Get all fields and values in a hash with type safety
   */
  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    return this.client.hgetall(key) as Promise<T | null>
  }

  /**
   * Create a pipeline for batched operations
   */
  pipeline() {
    return new UpstashPipelineWrapper(this.client.pipeline())
  }

  /**
   * Set multiple fields in a hash
   */
  async hmset(key: string, value: Record<string, any>): Promise<'OK'> {
    return this.client.hmset(key, value)
  }

  /**
   * Add a member to a sorted set
   */
  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    return this.client.zadd(key, { score, member })
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  /**
   * Remove a member from a sorted set
   */
  async zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member)
  }

  /**
   * Close the Redis connection (no-op for Upstash)
   */
  async close(): Promise<void> {
    // Upstash Redis doesn't require explicit closing
    return
  }
}

/**
 * Wrapper class for Upstash Redis pipeline
 * Provides a fluent interface for chaining commands
 */
class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>

  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline
  }

  /**
   * Add hgetall command to pipeline
   */
  hgetall(key: string) {
    this.pipeline.hgetall(key)
    return this
  }

  /**
   * Add del command to pipeline
   */
  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  /**
   * Add zrem command to pipeline
   */
  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member)
    return this
  }

  /**
   * Add hmset command to pipeline
   */
  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value)
    return this
  }

  /**
   * Add zadd command to pipeline
   */
  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member })
    return this
  }

  /**
   * Execute all commands in the pipeline
   */
  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

/**
 * Get a singleton Redis client instance
 * Creates a new instance if one doesn't exist
 * @returns A wrapped Redis client
 */
export async function getRedisClient(): Promise<RedisWrapper> {
  if (redisWrapper) {
    return redisWrapper
  }

  if (!redisConfig.upstashRedisRestUrl || !redisConfig.upstashRedisRestToken) {
    throw new Error(
      'Upstash Redis configuration is missing. Please check your environment variables.'
    )
  }

  try {
    redisWrapper = new RedisWrapper(
      new Redis({
        url: redisConfig.upstashRedisRestUrl,
        token: redisConfig.upstashRedisRestToken
      })
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('unauthorized')) {
        console.error(
          'Failed to connect to Upstash Redis: Unauthorized. Check your Upstash Redis token.'
        )
      } else if (error.message.includes('not found')) {
        console.error(
          'Failed to connect to Upstash Redis: URL not found. Check your Upstash Redis URL.'
        )
      } else {
        console.error('Failed to connect to Upstash Redis:', error.message)
      }
    } else {
      console.error(
        'An unexpected error occurred while connecting to Upstash Redis:',
        error
      )
    }
    throw new Error(
      'Failed to connect to Upstash Redis. Check your configuration and credentials.'
    )
  }

  return redisWrapper
}

/**
 * Close and cleanup the Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    redisWrapper = null
  }
}

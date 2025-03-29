import { Redis } from '@upstash/redis'

export type RedisConfig = {
  upstashRedisRestUrl: string
  upstashRedisRestToken: string
}

export const redisConfig: RedisConfig = {
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || '',
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || ''
}

let redisWrapper: RedisWrapper | null = null

// Wrapper class for Redis client
export class RedisWrapper {
  private client: Redis

  constructor(client: Redis) {
    this.client = client
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    return await this.client.zrange(key, start, stop, options)
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    return this.client.hgetall(key) as Promise<T | null>
  }

  pipeline() {
    return new UpstashPipelineWrapper(this.client.pipeline())
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK'> {
    return this.client.hmset(key, value)
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    return this.client.zadd(key, { score, member })
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member)
  }

  async close(): Promise<void> {
    // Upstash Redis doesn't require explicit closing
    return
  }
}

// Wrapper class for Upstash Redis pipeline
class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>

  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hgetall(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member })
    return this
  }

  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

// Function to get a Redis client
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

// Function to close the Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    redisWrapper = null
  }
}

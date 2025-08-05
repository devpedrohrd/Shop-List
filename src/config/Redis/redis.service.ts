import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import Redis, { Redis as RedisClient } from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient

  onModuleInit() {
    this.redisClient = new Redis(process.env.REDIS_URL || '')

    this.redisClient.on('connect', () => {
      console.log('✅ Conectado ao Redis com sucesso!')
    })

    this.redisClient.on('error', (err) => {
      console.error('❌ Erro ao conectar ao Redis:', err.message)
    })
  }

  onModuleDestroy() {
    this.redisClient.quit()
  }

  async set<T>(key: string, value: T, ttl = 60): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl)
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key)
    return value ? JSON.parse(value) : null
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key)
  }
}
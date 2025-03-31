import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { createBlacklistKey, createSessionKey } from '../config/redis.config';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redis: Redis
    ) {}

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.setex(key, ttl, typeof value === 'string' ? value : JSON.stringify(value));
        } else {
            await this.redis.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const exists = await this.redis.exists(key);
        return exists === 1;
    }

    async getAllKeys(pattern: string = '*'): Promise<string[]> {
        return await this.redis.keys(pattern);
    }

    // Session 
    async setSession(sessionId: string, data: any, ttl: number): Promise<void> {
        const key = createSessionKey(sessionId);
        await this.set(key, data, ttl);
    }

    async getSession(sessionId: string): Promise<any> {
        const key = createSessionKey(sessionId);
        return this.get(key);
    }

    async removeSession(sessionId: string): Promise<void> {
        const key = createSessionKey(sessionId);
        await this.del(key);
    }

    // Blacklist
    async blacklistToken(jti: string, ttl: number): Promise<void> {
        const key = createBlacklistKey(jti);
        await this.set(key, 'true', ttl);
    }

    async isTokenBlacklisted(jti: string): Promise<boolean> {
        const key = createBlacklistKey(jti);
        return this.exists(key);
    }
}
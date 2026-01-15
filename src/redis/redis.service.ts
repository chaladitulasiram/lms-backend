import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
    private readonly TOKEN_BLACKLIST_PREFIX = 'blacklist:token:';
    private readonly SESSION_PREFIX = 'session:';

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        this.client = new Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    /**
     * Blacklist a JWT token (for logout functionality)
     * @param token - The JWT token to blacklist
     * @param expiresIn - Time in seconds until token naturally expires
     */
    async blacklistToken(token: string, expiresIn: number): Promise<void> {
        const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
        await this.client.setex(key, expiresIn, '1');
    }

    /**
     * Check if a token is blacklisted
     * @param token - The JWT token to check
     * @returns true if blacklisted, false otherwise
     */
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
        const result = await this.client.get(key);
        return result !== null;
    }

    /**
     * Store a user session
     * @param userId - The user ID
     * @param sessionData - Session data to store
     * @param ttl - Time to live in seconds (default: 7 days)
     */
    async setSession(userId: string, sessionData: any, ttl: number = 604800): Promise<void> {
        const key = `${this.SESSION_PREFIX}${userId}`;
        await this.client.setex(key, ttl, JSON.stringify(sessionData));
    }

    /**
     * Get a user session
     * @param userId - The user ID
     * @returns Session data or null if not found
     */
    async getSession(userId: string): Promise<any> {
        const key = `${this.SESSION_PREFIX}${userId}`;
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Delete a user session
     * @param userId - The user ID
     */
    async deleteSession(userId: string): Promise<void> {
        const key = `${this.SESSION_PREFIX}${userId}`;
        await this.client.del(key);
    }

    /**
     * Generic set operation with expiration
     * @param key - Redis key
     * @param value - Value to store
     * @param ttl - Time to live in seconds
     */
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.setex(key, ttl, value);
        } else {
            await this.client.set(key, value);
        }
    }

    /**
     * Generic get operation
     * @param key - Redis key
     * @returns Value or null if not found
     */
    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    /**
     * Delete a key
     * @param key - Redis key
     */
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Check if key exists
     * @param key - Redis key
     * @returns true if exists, false otherwise
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    /**
     * Increment a counter
     * @param key - Redis key
     * @returns New value after increment
     */
    async incr(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    /**
     * Set expiration on a key
     * @param key - Redis key
     * @param seconds - Seconds until expiration
     */
    async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }
}

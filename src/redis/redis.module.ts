import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IoRedis, { type Redis } from 'ioredis';

export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';

function createRedisConnection(configService: ConfigService): Redis {
  const redisUrl = configService.get<string>('REDIS_URL');

  if (redisUrl) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new IoRedis(redisUrl) as Redis;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return new IoRedis({
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
  }) as Redis;
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUBLISHER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        createRedisConnection(configService),
    },
    {
      provide: REDIS_SUBSCRIBER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        createRedisConnection(configService),
    },
  ],
  exports: [REDIS_PUBLISHER, REDIS_SUBSCRIBER],
})
export class RedisModule {}

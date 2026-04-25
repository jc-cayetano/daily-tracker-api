import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER } from '../redis/redis.module';

@Injectable()
export class EventPublisherService {
  constructor(
    @Inject(REDIS_PUBLISHER)
    private readonly publisher: Redis,
  ) {}

  publishToProject(
    projectId: string,
    eventType: string,
    data: Record<string, unknown>,
  ): void {
    const channel = `project:${projectId}:events`;
    const payload = JSON.stringify({ event: eventType, data });
    void this.publisher.publish(channel, payload);
  }

  publishToUser(
    userId: string,
    eventType: string,
    data: Record<string, unknown>,
  ): void {
    const channel = `user:${userId}:events`;
    const payload = JSON.stringify({ event: eventType, data });
    void this.publisher.publish(channel, payload);
  }
}

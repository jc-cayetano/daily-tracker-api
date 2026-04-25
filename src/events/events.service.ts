import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { REDIS_SUBSCRIBER } from '../redis/redis.module';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { UserRole } from '../auth/entities/user.entity';

interface SseEvent {
  type: string;
  data: string;
}

interface ClientConnection {
  userId: string;
  role: UserRole;
  subject: Subject<SseEvent>;
  channels: Set<string>;
}

@Injectable()
export class EventsService implements OnModuleDestroy {
  private readonly clients = new Map<string, ClientConnection>();
  private isListening = false;

  constructor(
    @Inject(REDIS_SUBSCRIBER)
    private readonly subscriber: Redis,
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
  ) {}

  async createStream(
    userId: string,
    role: UserRole,
  ): Promise<Observable<MessageEvent>> {
    const subject = new Subject<SseEvent>();
    const channels = new Set<string>();

    // Subscribe to personal channel
    const personalChannel = `user:${userId}:events`;
    channels.add(personalChannel);
    await this.subscriber.subscribe(personalChannel);

    // Subscribe to project channels (skip for admin — deferred)
    const subscribedProjects: string[] = [];
    if (role !== UserRole.ADMIN) {
      const memberships = await this.memberRepository.find({
        where: { user: { id: userId } },
        relations: ['project'],
      });

      for (const membership of memberships) {
        const channel = `project:${membership.project.id}:events`;
        channels.add(channel);
        await this.subscriber.subscribe(channel);
        subscribedProjects.push(membership.project.id);
      }
    }

    const connection: ClientConnection = { userId, role, subject, channels };
    this.clients.set(userId, connection);

    if (!this.isListening) {
      this.startListening();
    }

    // Send connected event
    subject.next({
      type: 'connected',
      data: JSON.stringify({ userId, subscribedProjects }),
    });

    return new Observable<MessageEvent>((observer) => {
      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        observer.next({ data: 'ping', type: 'heartbeat' } as MessageEvent);
      }, 30000);

      const subscription = subject.subscribe({
        next: (event) => {
          observer.next({
            data: event.data,
            type: event.type,
          } as MessageEvent);
        },
        complete: () => observer.complete(),
      });

      // Cleanup on disconnect
      return () => {
        clearInterval(heartbeat);
        subscription.unsubscribe();
        void this.removeClient(userId);
      };
    });
  }

  async subscribeToProject(userId: string, projectId: string): Promise<void> {
    const client = this.clients.get(userId);
    if (!client) return;

    const channel = `project:${projectId}:events`;
    if (!client.channels.has(channel)) {
      client.channels.add(channel);
      await this.subscriber.subscribe(channel);
    }
  }

  async unsubscribeFromProject(
    userId: string,
    projectId: string,
  ): Promise<void> {
    const client = this.clients.get(userId);
    if (!client) return;

    const channel = `project:${projectId}:events`;
    if (client.channels.has(channel)) {
      client.channels.delete(channel);
      await this.subscriber.unsubscribe(channel);
    }
  }

  private startListening(): void {
    this.isListening = true;

    this.subscriber.on('message', (channel: string, message: string) => {
      try {
        const parsed = JSON.parse(message) as {
          event: string;
          data: Record<string, unknown>;
        };

        for (const [, client] of this.clients) {
          if (client.channels.has(channel)) {
            client.subject.next({
              type: parsed.event,
              data: JSON.stringify(parsed.data),
            });

            // Handle dynamic subscriptions for member events
            if (parsed.event === 'member:added') {
              const data = parsed.data as {
                projectId: string;
                member: { userId: string };
              };
              if (data.member.userId === client.userId) {
                void this.subscribeToProject(client.userId, data.projectId);
              }
            }

            if (parsed.event === 'member:removed') {
              const data = parsed.data as {
                projectId: string;
                userId: string;
              };
              if (data.userId === client.userId) {
                void this.unsubscribeFromProject(client.userId, data.projectId);
              }
            }
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });
  }

  private async removeClient(userId: string): Promise<void> {
    const client = this.clients.get(userId);
    if (!client) return;

    for (const channel of client.channels) {
      await this.subscriber.unsubscribe(channel);
    }

    client.subject.complete();
    this.clients.delete(userId);
  }

  async onModuleDestroy(): Promise<void> {
    for (const [userId] of this.clients) {
      await this.removeClient(userId);
    }
  }
}

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { EventPublisherService } from './event-publisher.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember])],
  controllers: [EventsController],
  providers: [EventPublisherService, EventsService],
  exports: [EventPublisherService, EventsService],
})
export class EventsModule {}

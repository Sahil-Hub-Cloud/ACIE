import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { ReposModule } from '../repos/repos.module';

@Module({
  imports: [ConfigModule, ReposModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}

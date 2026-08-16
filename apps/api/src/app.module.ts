import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReposModule } from './modules/repos/repos.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    AuthModule,
    ReposModule,
    AnalysisModule,
    WebhooksModule,
    DashboardModule,
  ],
})
export class AppModule {}

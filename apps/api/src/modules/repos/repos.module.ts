import { Module } from '@nestjs/common';
import { ReposService } from './repos.service';
import { ReposController } from './repos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ReposService],
  controllers: [ReposController],
  exports: [ReposService],
})
export class ReposModule {}

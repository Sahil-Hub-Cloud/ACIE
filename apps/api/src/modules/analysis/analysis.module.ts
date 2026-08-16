import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
  exports: [AnalysisService],
})
export class AnalysisModule {}

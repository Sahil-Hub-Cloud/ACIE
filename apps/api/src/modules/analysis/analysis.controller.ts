import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { ChangedSymbol } from '@acie/shared';

@Controller('api/analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Get()
  async findAll() {
    return this.analysisService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.analysisService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.analysisService.findOne(id);
  }

  @Post('preview')
  async preview(@Body('changedSymbols') changedSymbols: ChangedSymbol[]) {
    return this.analysisService.preview(changedSymbols || []);
  }
}

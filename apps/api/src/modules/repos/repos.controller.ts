import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReposService } from './repos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/repos')
@UseGuards(JwtAuthGuard)
export class ReposController {
  constructor(private reposService: ReposService) {}

  @Get()
  async findAll() {
    return this.reposService.findAll();
  }

  @Post()
  async addRepo(@Body() body: { githubId: number; name: string; owner: string; url: string; language: string; isMonorepo?: boolean; monorepoTool?: string }) {
    return this.reposService.addRepo(body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reposService.findOne(id);
  }

  @Delete(':id')
  async removeRepo(@Param('id', ParseIntPipe) id: number) {
    return this.reposService.removeRepo(id);
  }

  @Post(':id/index')
  async triggerIndexing(@Param('id', ParseIntPipe) id: number) {
    return this.reposService.triggerIndexing(id);
  }

  @Get(':id/graph')
  async getGraph(@Param('id', ParseIntPipe) id: number) {
    return this.reposService.getGraph(id);
  }
}

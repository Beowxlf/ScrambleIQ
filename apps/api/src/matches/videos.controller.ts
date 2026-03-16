import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { MatchVideo } from '@scrambleiq/shared';

import { CreateMatchVideoDto } from './create-match-video.dto';
import { UpdateMatchVideoDto } from './update-match-video.dto';
import { VideosService } from './videos.service';

@Controller()
export class VideosController {
  constructor(@Inject(VideosService) private readonly videosService: VideosService) {}

  @Post('matches/:id/video')
  create(@Param('id', ParseUUIDPipe) matchId: string, @Body() payload: CreateMatchVideoDto): Promise<MatchVideo> {
    return this.videosService.create(matchId, payload);
  }

  @Get('matches/:id/video')
  findByMatch(@Param('id', ParseUUIDPipe) matchId: string): Promise<MatchVideo> {
    return this.videosService.findByMatch(matchId);
  }

  @Patch('video/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateMatchVideoDto): Promise<MatchVideo> {
    return this.videosService.update(id, payload);
  }

  @Delete('video/:id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.videosService.delete(id);
  }
}

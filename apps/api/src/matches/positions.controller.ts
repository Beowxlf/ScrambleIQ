import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post } from '@nestjs/common';
import type { PositionState } from '@scrambleiq/shared';

import { CreatePositionStateDto } from './create-position-state.dto';
import { PositionsService } from './positions.service';
import { UpdatePositionStateDto } from './update-position-state.dto';

@Controller()
export class PositionsController {
  constructor(@Inject(PositionsService) private readonly positionsService: PositionsService) {}

  @Post('matches/:id/positions')
  create(@Param('id') matchId: string, @Body() payload: CreatePositionStateDto): PositionState {
    return this.positionsService.create(matchId, payload);
  }

  @Get('matches/:id/positions')
  findByMatch(@Param('id') matchId: string): PositionState[] {
    return this.positionsService.findByMatch(matchId);
  }

  @Patch('positions/:id')
  update(@Param('id') id: string, @Body() payload: UpdatePositionStateDto): PositionState {
    return this.positionsService.update(id, payload);
  }

  @Delete('positions/:id')
  @HttpCode(204)
  delete(@Param('id') id: string): void {
    this.positionsService.delete(id);
  }
}

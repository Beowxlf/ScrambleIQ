import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import type { Match } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { MatchesService } from './matches.service';
import { UpdateMatchDto } from './update-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(@Inject(MatchesService) private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto): Match {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll(): Match[] {
    return this.matchesService.findAll();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto): Match {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Match {
    return this.matchesService.findOne(id);
  }
}

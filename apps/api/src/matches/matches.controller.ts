import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { CreateMatchDto } from './create-match.dto';
import { Match } from './match.model';
import { MatchesService } from './matches.service';

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

  @Get(':id')
  findOne(@Param('id') id: string): Match {
    return this.matchesService.findOne(id);
  }
}

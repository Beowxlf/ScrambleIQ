import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PositionState } from '@scrambleiq/shared';

import { MatchRepository, MATCH_REPOSITORY } from '../repositories/match.repository';
import { PositionRepository, POSITION_REPOSITORY } from '../repositories/position.repository';
import { CreatePositionStateDto } from './create-position-state.dto';
import { UpdatePositionStateDto } from './update-position-state.dto';
import { validateCreatePositionStatePayload, validateUpdatePositionStatePayload } from './position-state-validation';

@Injectable()
export class PositionsService {
  constructor(
    @Inject(POSITION_REPOSITORY) private readonly positionRepository: PositionRepository,
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
  ) {}

  async create(matchId: string, input: CreatePositionStateDto): Promise<PositionState> {
    const errors = validateCreatePositionStatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    await this.ensureNoOverlap(matchId, input.timestampStart, input.timestampEnd);

    return this.positionRepository.create(matchId, input);
  }

  async findByMatch(matchId: string): Promise<PositionState[]> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.positionRepository.findByMatchId(matchId);
  }

  async update(id: string, input: UpdatePositionStateDto): Promise<PositionState> {
    const errors = validateUpdatePositionStatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const currentPosition = await this.positionRepository.findById(id);

    if (!currentPosition) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }

    const timestampStart = input.timestampStart ?? currentPosition.timestampStart;
    const timestampEnd = input.timestampEnd ?? currentPosition.timestampEnd;

    if (timestampEnd <= timestampStart) {
      throw new BadRequestException(['timestampEnd must be greater than timestampStart']);
    }

    await this.ensureNoOverlap(currentPosition.matchId, timestampStart, timestampEnd, id);

    const updated = await this.positionRepository.update(id, input);

    if (!updated) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const existingPosition = await this.positionRepository.findById(id);

    if (!existingPosition) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }

    const isDeleted = await this.positionRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Position state with id ${id} was not found.`);
    }
  }

  private async ensureNoOverlap(matchId: string, start: number, end: number, excludeId?: string): Promise<void> {
    const hasOverlap = (await this.positionRepository.findByMatchId(matchId))
      .some((position) => position.id !== excludeId && start < position.timestampEnd && end > position.timestampStart);

    if (hasOverlap) {
      throw new BadRequestException(['Position state timestamps must not overlap existing segments']);
    }
  }
}

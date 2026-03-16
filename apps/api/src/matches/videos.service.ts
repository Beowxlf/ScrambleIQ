import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MatchVideo } from '@scrambleiq/shared';

import { MatchRepository, MATCH_REPOSITORY } from '../repositories/match.repository';
import { VideoRepository, VIDEO_REPOSITORY } from '../repositories/video.repository';
import { CreateMatchVideoDto } from './create-match-video.dto';
import { validateCreateMatchVideoPayload, validateUpdateMatchVideoPayload } from './match-video-validation';
import { UpdateMatchVideoDto } from './update-match-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @Inject(VIDEO_REPOSITORY) private readonly videoRepository: VideoRepository,
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
  ) {}

  async create(matchId: string, input: CreateMatchVideoDto): Promise<MatchVideo> {
    const errors = validateCreateMatchVideoPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.videoRepository.create(matchId, input);
  }

  async findByMatch(matchId: string): Promise<MatchVideo> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    const video = await this.videoRepository.findByMatchId(matchId);

    if (!video) {
      throw new NotFoundException(`Match video for match id ${matchId} was not found.`);
    }

    return video;
  }

  async update(id: string, input: UpdateMatchVideoDto): Promise<MatchVideo> {
    const errors = validateUpdateMatchVideoPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const existing = await this.videoRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    const updated = await this.videoRepository.update(id, input);

    if (!updated) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.videoRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    const isDeleted = await this.videoRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }
  }
}

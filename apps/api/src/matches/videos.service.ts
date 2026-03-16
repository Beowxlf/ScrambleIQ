import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MatchVideo } from '@scrambleiq/shared';

import { CreateMatchVideoDto } from './create-match-video.dto';
import { validateCreateMatchVideoPayload, validateUpdateMatchVideoPayload } from './match-video-validation';
import { UpdateMatchVideoDto } from './update-match-video.dto';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';
import { VideoStore } from './store/video-store';
import { VIDEO_STORE } from './store/video-store.token';

@Injectable()
export class VideosService {
  constructor(
    @Inject(VIDEO_STORE) private readonly videoStore: VideoStore,
    @Inject(MATCH_STORE) private readonly matchStore: MatchStore,
  ) {}

  create(matchId: string, input: CreateMatchVideoDto): MatchVideo {
    const errors = validateCreateMatchVideoPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.videoStore.create(matchId, input);
  }

  findByMatch(matchId: string): MatchVideo {
    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    const video = this.videoStore.findVideoByMatchId(matchId);

    if (!video) {
      throw new NotFoundException(`Match video for match id ${matchId} was not found.`);
    }

    return video;
  }

  update(id: string, input: UpdateMatchVideoDto): MatchVideo {
    const errors = validateUpdateMatchVideoPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const existing = this.videoStore.findVideoById(id);

    if (!existing) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    const updated = this.videoStore.update(id, input);

    if (!updated) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    return updated;
  }

  delete(id: string): void {
    const existing = this.videoStore.findVideoById(id);

    if (!existing) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }

    const isDeleted = this.videoStore.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Match video with id ${id} was not found.`);
    }
  }
}

import type { CreateMatchVideoDto, MatchVideo, UpdateMatchVideoDto } from '@scrambleiq/shared';

export interface VideoRepository {
  create(matchId: string, input: CreateMatchVideoDto): Promise<MatchVideo>;
  findByMatchId(matchId: string): Promise<MatchVideo | undefined>;
  findById(id: string): Promise<MatchVideo | undefined>;
  update(id: string, input: UpdateMatchVideoDto): Promise<MatchVideo | undefined>;
  delete(id: string): Promise<boolean>;
}

export const VIDEO_REPOSITORY = Symbol('VIDEO_REPOSITORY');

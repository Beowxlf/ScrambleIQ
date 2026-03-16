import type { CreateMatchVideoDto, MatchVideo, UpdateMatchVideoDto } from '@scrambleiq/shared';

export interface VideoStore {
  create(matchId: string, input: CreateMatchVideoDto): MatchVideo;
  findVideoByMatchId(matchId: string): MatchVideo | undefined;
  findVideoById(id: string): MatchVideo | undefined;
  update(id: string, input: UpdateMatchVideoDto): MatchVideo | undefined;
  delete(id: string): boolean;
  deleteByMatchId(matchId: string): void;
}

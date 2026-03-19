import { Injectable } from '@nestjs/common';
import type {
  CreateMatchDto,
  CreateMatchVideoDto,
  CreatePositionStateDto,
  CreateTimelineEventDto,
  DatasetValidationReport,
  Match,
  MatchSummary,
  MatchVideo,
  PositionState,
  TimelineEvent,
  UpdateMatchDto,
  UpdateMatchVideoDto,
  UpdatePositionStateDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

import { DatasetValidationRepository } from './dataset-validation.repository';
import { EventRepository } from './event.repository';
import { MatchRepository } from './match.repository';
import { PositionRepository } from './position.repository';
import { VideoRepository } from './video.repository';

@Injectable()
export class InMemoryMatchRepository implements MatchRepository {
  constructor(
    private readonly matches: Match[],
    private readonly events: TimelineEvent[],
    private readonly positions: PositionState[],
    private readonly videos: MatchVideo[],
  ) {}

  async create(input: CreateMatchDto): Promise<Match> {
    const match: Match = { id: crypto.randomUUID(), notes: input.notes ?? '', ...input };
    this.matches.push(match);
    return match;
  }

  async findAll(): Promise<Match[]> {
    return [...this.matches].sort((a, b) => b.date.localeCompare(a.date));
  }

  async findAllSummaries(): Promise<MatchSummary[]> {
    const eventCounts = this.events.reduce<Map<string, number>>((acc, event) => {
      acc.set(event.matchId, (acc.get(event.matchId) ?? 0) + 1);
      return acc;
    }, new Map());

    const positionCounts = this.positions.reduce<Map<string, number>>((acc, position) => {
      acc.set(position.matchId, (acc.get(position.matchId) ?? 0) + 1);
      return acc;
    }, new Map());

    const matchIdsWithVideo = new Set(this.videos.map((video) => video.matchId));

    return this.matches
      .map((match) => ({
        matchId: match.id,
        title: match.title,
        competitorA: match.competitorA,
        competitorB: match.competitorB,
        eventDate: match.date,
        eventCount: eventCounts.get(match.id) ?? 0,
        positionCount: positionCounts.get(match.id) ?? 0,
        hasVideo: matchIdsWithVideo.has(match.id),
      }))
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate) || b.matchId.localeCompare(a.matchId));
  }

  async findById(id: string): Promise<Match | undefined> {
    return this.matches.find((match) => match.id === id);
  }

  async update(id: string, input: UpdateMatchDto): Promise<Match | undefined> {
    const match = this.matches.find((item) => item.id === id);

    if (!match) {
      return undefined;
    }

    Object.assign(match, input);
    return match;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.matches.findIndex((match) => match.id === id);

    if (index < 0) {
      return false;
    }

    this.matches.splice(index, 1);
    return true;
  }
}

@Injectable()
export class InMemoryEventRepository implements EventRepository {
  constructor(private readonly events: TimelineEvent[]) {}

  async create(matchId: string, input: CreateTimelineEventDto): Promise<TimelineEvent> {
    const event: TimelineEvent = { id: crypto.randomUUID(), matchId, ...input };
    this.events.push(event);
    return event;
  }

  async findByMatchId(matchId: string): Promise<TimelineEvent[]> {
    return this.events.filter((event) => event.matchId === matchId).sort((a, b) => a.timestamp - b.timestamp);
  }

  async findById(id: string): Promise<TimelineEvent | undefined> {
    return this.events.find((event) => event.id === id);
  }

  async update(id: string, input: UpdateTimelineEventDto): Promise<TimelineEvent | undefined> {
    const event = this.events.find((item) => item.id === id);

    if (!event) {
      return undefined;
    }

    Object.assign(event, input);
    return event;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.events.findIndex((event) => event.id === id);

    if (index < 0) {
      return false;
    }

    this.events.splice(index, 1);
    return true;
  }
}

@Injectable()
export class InMemoryPositionRepository implements PositionRepository {
  constructor(private readonly positions: PositionState[]) {}

  async create(matchId: string, input: CreatePositionStateDto): Promise<PositionState> {
    const position: PositionState = { id: crypto.randomUUID(), matchId, ...input };
    this.positions.push(position);
    return position;
  }

  async findByMatchId(matchId: string): Promise<PositionState[]> {
    return this.positions
      .filter((position) => position.matchId === matchId)
      .sort((a, b) => a.timestampStart - b.timestampStart);
  }

  async findById(id: string): Promise<PositionState | undefined> {
    return this.positions.find((position) => position.id === id);
  }

  async update(id: string, input: UpdatePositionStateDto): Promise<PositionState | undefined> {
    const position = this.positions.find((item) => item.id === id);

    if (!position) {
      return undefined;
    }

    Object.assign(position, input);
    return position;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.positions.findIndex((position) => position.id === id);

    if (index < 0) {
      return false;
    }

    this.positions.splice(index, 1);
    return true;
  }
}

@Injectable()
export class InMemoryVideoRepository implements VideoRepository {
  constructor(private readonly videos: MatchVideo[]) {}

  async create(matchId: string, input: CreateMatchVideoDto): Promise<MatchVideo> {
    const existing = this.videos.findIndex((video) => video.matchId === matchId);

    const video: MatchVideo = {
      id: existing >= 0 ? this.videos[existing].id : crypto.randomUUID(),
      matchId,
      ...input,
    };

    if (existing >= 0) {
      this.videos[existing] = video;
    } else {
      this.videos.push(video);
    }

    return video;
  }

  async findByMatchId(matchId: string): Promise<MatchVideo | undefined> {
    return this.videos.find((video) => video.matchId === matchId);
  }

  async findById(id: string): Promise<MatchVideo | undefined> {
    return this.videos.find((video) => video.id === id);
  }

  async update(id: string, input: UpdateMatchVideoDto): Promise<MatchVideo | undefined> {
    const video = this.videos.find((item) => item.id === id);

    if (!video) {
      return undefined;
    }

    Object.assign(video, input);
    return video;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.videos.findIndex((video) => video.id === id);

    if (index < 0) {
      return false;
    }

    this.videos.splice(index, 1);
    return true;
  }
}

@Injectable()
export class InMemoryDatasetValidationRepository implements DatasetValidationRepository {
  private readonly reports = new Map<string, DatasetValidationReport>();

  async upsert(matchId: string, report: DatasetValidationReport): Promise<void> {
    this.reports.set(matchId, report);
  }

  async findByMatchId(matchId: string): Promise<DatasetValidationReport | undefined> {
    return this.reports.get(matchId);
  }
}

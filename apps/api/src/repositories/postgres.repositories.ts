import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateMatchDto,
  CreateMatchVideoDto,
  CreatePositionStateDto,
  CreateTimelineEventDto,
  DatasetValidationReport,
  Match,
  MatchVideo,
  PositionState,
  TimelineEvent,
  UpdateMatchDto,
  UpdateMatchVideoDto,
  UpdatePositionStateDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

import { PsqlClient, sqlLiteral } from '../database/database.client';
import { DATABASE_CLIENT } from '../database/database.tokens';
import { DatasetValidationRepository } from './dataset-validation.repository';
import { EventRepository } from './event.repository';
import { MatchRepository } from './match.repository';
import { PositionRepository } from './position.repository';
import { VideoRepository } from './video.repository';

@Injectable()
export class PostgresMatchRepository implements MatchRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: PsqlClient) {}
  async create(input: CreateMatchDto): Promise<Match> {
    const rows = await this.client.rows<Match>(`INSERT INTO matches (title, date, ruleset, competitor_a, competitor_b, notes)
      VALUES (${sqlLiteral(input.title)}, ${sqlLiteral(input.date)}, ${sqlLiteral(input.ruleset)}, ${sqlLiteral(input.competitorA)}, ${sqlLiteral(input.competitorB)}, ${sqlLiteral(input.notes ?? '')})
      RETURNING id, title, date::text as date, ruleset, competitor_a as "competitorA", competitor_b as "competitorB", notes`);
    return rows[0];
  }
  async findAll(): Promise<Match[]> { return this.client.rows<Match>('SELECT id,title,date::text as date,ruleset,competitor_a as "competitorA",competitor_b as "competitorB",notes FROM matches ORDER BY date DESC, id DESC'); }
  async findById(id: string): Promise<Match | undefined> { return (await this.client.rows<Match>(`SELECT id,title,date::text as date,ruleset,competitor_a as "competitorA",competitor_b as "competitorB",notes FROM matches WHERE id=${sqlLiteral(id)}`))[0]; }
  async update(id: string, input: UpdateMatchDto): Promise<Match | undefined> {
    return (await this.client.rows<Match>(`UPDATE matches SET title=COALESCE(${sqlLiteral(input.title)},title),date=COALESCE(${sqlLiteral(input.date)},date),ruleset=COALESCE(${sqlLiteral(input.ruleset)},ruleset),competitor_a=COALESCE(${sqlLiteral(input.competitorA)},competitor_a),competitor_b=COALESCE(${sqlLiteral(input.competitorB)},competitor_b),notes=COALESCE(${sqlLiteral(input.notes)},notes),updated_at=NOW() WHERE id=${sqlLiteral(id)} RETURNING id,title,date::text as date,ruleset,competitor_a as "competitorA",competitor_b as "competitorB",notes`))[0];
  }
  async delete(id: string): Promise<boolean> {
    const rows = await this.client.rows<{ id: string }>(`DELETE FROM matches WHERE id=${sqlLiteral(id)} RETURNING id`);
    return rows.length > 0;
  }
}

@Injectable()
export class PostgresEventRepository implements EventRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: PsqlClient) {}
  async create(matchId: string, input: CreateTimelineEventDto): Promise<TimelineEvent> { return (await this.client.rows<TimelineEvent>(`INSERT INTO events (match_id,timestamp_seconds,event_type,competitor,notes) VALUES (${sqlLiteral(matchId)},${sqlLiteral(input.timestamp)},${sqlLiteral(input.eventType)},${sqlLiteral(input.competitor)},${sqlLiteral(input.notes)}) RETURNING id,match_id as "matchId",timestamp_seconds as timestamp,event_type as "eventType",competitor,notes`))[0]; }
  async findByMatchId(matchId: string): Promise<TimelineEvent[]> { return this.client.rows<TimelineEvent>(`SELECT id,match_id as "matchId",timestamp_seconds as timestamp,event_type as "eventType",competitor,notes FROM events WHERE match_id=${sqlLiteral(matchId)} ORDER BY timestamp_seconds ASC`); }
  async findById(id: string): Promise<TimelineEvent | undefined> { return (await this.client.rows<TimelineEvent>(`SELECT id,match_id as "matchId",timestamp_seconds as timestamp,event_type as "eventType",competitor,notes FROM events WHERE id=${sqlLiteral(id)}`))[0]; }
  async update(id: string, input: UpdateTimelineEventDto): Promise<TimelineEvent | undefined> { return (await this.client.rows<TimelineEvent>(`UPDATE events SET timestamp_seconds=COALESCE(${sqlLiteral(input.timestamp)},timestamp_seconds),event_type=COALESCE(${sqlLiteral(input.eventType)},event_type),competitor=COALESCE(${sqlLiteral(input.competitor)},competitor),notes=COALESCE(${sqlLiteral(input.notes)},notes),updated_at=NOW() WHERE id=${sqlLiteral(id)} RETURNING id,match_id as "matchId",timestamp_seconds as timestamp,event_type as "eventType",competitor,notes`))[0]; }
  async delete(id: string): Promise<boolean> {
    const rows = await this.client.rows<{ id: string }>(`DELETE FROM events WHERE id=${sqlLiteral(id)} RETURNING id`);
    return rows.length > 0;
  }
}

@Injectable()
export class PostgresPositionRepository implements PositionRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: PsqlClient) {}
  async create(matchId: string, input: CreatePositionStateDto): Promise<PositionState> { return (await this.client.rows<PositionState>(`INSERT INTO positions (match_id,position,competitor_top,timestamp_start,timestamp_end,notes) VALUES (${sqlLiteral(matchId)},${sqlLiteral(input.position)},${sqlLiteral(input.competitorTop)},${sqlLiteral(input.timestampStart)},${sqlLiteral(input.timestampEnd)},${sqlLiteral(input.notes)}) RETURNING id,match_id as "matchId",position,competitor_top as "competitorTop",timestamp_start as "timestampStart",timestamp_end as "timestampEnd",notes`))[0]; }
  async findByMatchId(matchId: string): Promise<PositionState[]> { return this.client.rows<PositionState>(`SELECT id,match_id as "matchId",position,competitor_top as "competitorTop",timestamp_start as "timestampStart",timestamp_end as "timestampEnd",notes FROM positions WHERE match_id=${sqlLiteral(matchId)} ORDER BY timestamp_start ASC`); }
  async findById(id: string): Promise<PositionState | undefined> { return (await this.client.rows<PositionState>(`SELECT id,match_id as "matchId",position,competitor_top as "competitorTop",timestamp_start as "timestampStart",timestamp_end as "timestampEnd",notes FROM positions WHERE id=${sqlLiteral(id)}`))[0]; }
  async update(id: string, input: UpdatePositionStateDto): Promise<PositionState | undefined> { return (await this.client.rows<PositionState>(`UPDATE positions SET position=COALESCE(${sqlLiteral(input.position)},position),competitor_top=COALESCE(${sqlLiteral(input.competitorTop)},competitor_top),timestamp_start=COALESCE(${sqlLiteral(input.timestampStart)},timestamp_start),timestamp_end=COALESCE(${sqlLiteral(input.timestampEnd)},timestamp_end),notes=COALESCE(${sqlLiteral(input.notes)},notes),updated_at=NOW() WHERE id=${sqlLiteral(id)} RETURNING id,match_id as "matchId",position,competitor_top as "competitorTop",timestamp_start as "timestampStart",timestamp_end as "timestampEnd",notes`))[0]; }
  async delete(id: string): Promise<boolean> {
    const rows = await this.client.rows<{ id: string }>(`DELETE FROM positions WHERE id=${sqlLiteral(id)} RETURNING id`);
    return rows.length > 0;
  }
}

@Injectable()
export class PostgresVideoRepository implements VideoRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: PsqlClient) {}
  async create(matchId: string, input: CreateMatchVideoDto): Promise<MatchVideo> { return (await this.client.rows<MatchVideo>(`INSERT INTO videos (match_id,title,source_type,source_url,duration_seconds,notes) VALUES (${sqlLiteral(matchId)},${sqlLiteral(input.title)},${sqlLiteral(input.sourceType)},${sqlLiteral(input.sourceUrl)},${sqlLiteral(input.durationSeconds)},${sqlLiteral(input.notes)}) ON CONFLICT (match_id) DO UPDATE SET title=EXCLUDED.title,source_type=EXCLUDED.source_type,source_url=EXCLUDED.source_url,duration_seconds=EXCLUDED.duration_seconds,notes=EXCLUDED.notes,updated_at=NOW() RETURNING id,match_id as "matchId",title,source_type as "sourceType",source_url as "sourceUrl",duration_seconds as "durationSeconds",notes`))[0]; }
  async findByMatchId(matchId: string): Promise<MatchVideo | undefined> { return (await this.client.rows<MatchVideo>(`SELECT id,match_id as "matchId",title,source_type as "sourceType",source_url as "sourceUrl",duration_seconds as "durationSeconds",notes FROM videos WHERE match_id=${sqlLiteral(matchId)}`))[0]; }
  async findById(id: string): Promise<MatchVideo | undefined> { return (await this.client.rows<MatchVideo>(`SELECT id,match_id as "matchId",title,source_type as "sourceType",source_url as "sourceUrl",duration_seconds as "durationSeconds",notes FROM videos WHERE id=${sqlLiteral(id)}`))[0]; }
  async update(id: string, input: UpdateMatchVideoDto): Promise<MatchVideo | undefined> { return (await this.client.rows<MatchVideo>(`UPDATE videos SET title=COALESCE(${sqlLiteral(input.title)},title),source_type=COALESCE(${sqlLiteral(input.sourceType)},source_type),source_url=COALESCE(${sqlLiteral(input.sourceUrl)},source_url),duration_seconds=COALESCE(${sqlLiteral(input.durationSeconds)},duration_seconds),notes=COALESCE(${sqlLiteral(input.notes)},notes),updated_at=NOW() WHERE id=${sqlLiteral(id)} RETURNING id,match_id as "matchId",title,source_type as "sourceType",source_url as "sourceUrl",duration_seconds as "durationSeconds",notes`))[0]; }
  async delete(id: string): Promise<boolean> {
    const rows = await this.client.rows<{ id: string }>(`DELETE FROM videos WHERE id=${sqlLiteral(id)} RETURNING id`);
    return rows.length > 0;
  }
}

@Injectable()
export class PostgresDatasetValidationRepository implements DatasetValidationRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: PsqlClient) {}
  async upsert(matchId: string, report: DatasetValidationReport): Promise<void> {
    await this.client.execute(`INSERT INTO dataset_validation_results (match_id,is_valid,issue_count,report) VALUES (${sqlLiteral(matchId)},${sqlLiteral(report.isValid)},${sqlLiteral(report.issueCount)},${sqlLiteral(JSON.stringify(report))}::jsonb) ON CONFLICT (match_id) DO UPDATE SET is_valid=EXCLUDED.is_valid,issue_count=EXCLUDED.issue_count,report=EXCLUDED.report,updated_at=NOW()`);
  }
}

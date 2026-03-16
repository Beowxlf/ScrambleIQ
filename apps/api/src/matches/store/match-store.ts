import { CreateMatchDto } from '../create-match.dto';
import { Match } from '../match.model';

export interface MatchStore {
  create(input: CreateMatchDto): Match;
  findAll(): Match[];
}

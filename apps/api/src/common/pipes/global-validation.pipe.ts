import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';

import { CreateMatchDto } from '../../matches/create-match.dto';
import { CreatePositionStateDto } from '../../matches/create-position-state.dto';
import { CreateTimelineEventDto } from '../../matches/create-timeline-event.dto';
import { UpdateMatchDto } from '../../matches/update-match.dto';
import { UpdatePositionStateDto } from '../../matches/update-position-state.dto';
import { UpdateTimelineEventDto } from '../../matches/update-timeline-event.dto';
import { CreateMatchVideoDto } from '../../matches/create-match-video.dto';
import { UpdateMatchVideoDto } from '../../matches/update-match-video.dto';
import { validateCreateMatchPayload, validateUpdateMatchPayload } from '../../matches/match-validation';
import {
  validateCreatePositionStatePayload,
  validateUpdatePositionStatePayload,
} from '../../matches/position-state-validation';
import {
  validateCreateTimelineEventPayload,
  validateUpdateTimelineEventPayload,
} from '../../matches/timeline-event-validation';
import { validateCreateMatchVideoPayload, validateUpdateMatchVideoPayload } from '../../matches/match-video-validation';

type PayloadValidator = (value: unknown) => string[];

const validatorsByMetatype = new Map<Type<unknown>, PayloadValidator>([
  [CreateMatchDto, (value) => validateCreateMatchPayload(value as CreateMatchDto)],
  [UpdateMatchDto, (value) => validateUpdateMatchPayload(value as UpdateMatchDto)],
  [CreateTimelineEventDto, (value) => validateCreateTimelineEventPayload(value as CreateTimelineEventDto)],
  [UpdateTimelineEventDto, (value) => validateUpdateTimelineEventPayload(value as UpdateTimelineEventDto)],
  [CreatePositionStateDto, (value) => validateCreatePositionStatePayload(value as CreatePositionStateDto)],
  [UpdatePositionStateDto, (value) => validateUpdatePositionStatePayload(value as UpdatePositionStateDto)],
  [CreateMatchVideoDto, (value) => validateCreateMatchVideoPayload(value as CreateMatchVideoDto)],
  [UpdateMatchVideoDto, (value) => validateUpdateMatchVideoPayload(value as UpdateMatchVideoDto)],
]);
const validatorsByMetatypeName = new Map<string, PayloadValidator>([
  ['CreateMatchDto', (value) => validateCreateMatchPayload(value as CreateMatchDto)],
  ['UpdateMatchDto', (value) => validateUpdateMatchPayload(value as UpdateMatchDto)],
  ['CreateTimelineEventDto', (value) => validateCreateTimelineEventPayload(value as CreateTimelineEventDto)],
  ['UpdateTimelineEventDto', (value) => validateUpdateTimelineEventPayload(value as UpdateTimelineEventDto)],
  ['CreatePositionStateDto', (value) => validateCreatePositionStatePayload(value as CreatePositionStateDto)],
  ['UpdatePositionStateDto', (value) => validateUpdatePositionStatePayload(value as UpdatePositionStateDto)],
  ['CreateMatchVideoDto', (value) => validateCreateMatchVideoPayload(value as CreateMatchVideoDto)],
  ['UpdateMatchVideoDto', (value) => validateUpdateMatchVideoPayload(value as UpdateMatchVideoDto)],
]);

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const validator = metadata.metatype
      ? (validatorsByMetatype.get(metadata.metatype) ?? validatorsByMetatypeName.get(metadata.metatype.name))
      : undefined;

    if (!validator) {
      return value;
    }

    const errors = validator(value);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }
}

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
import { validateCreateReviewTemplatePayload, validateUpdateReviewTemplatePayload } from '../../review-templates/review-template-validation';
import { CreateReviewTemplateDto } from '../../review-templates/create-review-template.dto';
import { UpdateReviewTemplateDto } from '../../review-templates/update-review-template.dto';

import { validateCreateReviewPresetPayload, validateUpdateReviewPresetPayload } from '../../review-presets/review-preset-validation';
import { CreateReviewPresetDto } from '../../review-presets/create-review-preset.dto';
import { UpdateReviewPresetDto } from '../../review-presets/update-review-preset.dto';

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
  [CreateReviewTemplateDto, (value) => validateCreateReviewTemplatePayload(value as CreateReviewTemplateDto)],
  [UpdateReviewTemplateDto, (value) => validateUpdateReviewTemplatePayload(value as UpdateReviewTemplateDto)],
  [CreateReviewPresetDto, (value) => validateCreateReviewPresetPayload(value as CreateReviewPresetDto)],
  [UpdateReviewPresetDto, (value) => validateUpdateReviewPresetPayload(value as UpdateReviewPresetDto)],
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
  ['CreateReviewTemplateDto', (value) => validateCreateReviewTemplatePayload(value as CreateReviewTemplateDto)],
  ['UpdateReviewTemplateDto', (value) => validateUpdateReviewTemplatePayload(value as UpdateReviewTemplateDto)],
  ['CreateReviewPresetDto', (value) => validateCreateReviewPresetPayload(value as CreateReviewPresetDto)],
  ['UpdateReviewPresetDto', (value) => validateUpdateReviewPresetPayload(value as UpdateReviewPresetDto)],
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

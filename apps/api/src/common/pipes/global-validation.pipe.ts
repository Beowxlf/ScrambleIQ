import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
}

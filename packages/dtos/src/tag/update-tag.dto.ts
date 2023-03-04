import { CreateTagDto } from './create-tag.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTagDto extends PartialType(CreateTagDto) {}

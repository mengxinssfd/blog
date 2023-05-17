import { PartialType } from '@nestjs/mapped-types';
import { CreateMemoryHelperDto } from './create-memory-helper.dto';

export class UpdateMemoryHelperDto extends PartialType(CreateMemoryHelperDto) {}

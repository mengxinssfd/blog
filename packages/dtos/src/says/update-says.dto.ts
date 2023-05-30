import { PartialType } from '@nestjs/mapped-types';
import { CreateSaysDto } from './create-says.dto';

export class UpdateSaysDto extends PartialType(CreateSaysDto) {}

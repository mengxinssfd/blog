import { PartialType } from '@nestjs/swagger';
import { CreateTestModDto } from './create-test-mod.dto';

export class UpdateTestModDto extends PartialType(CreateTestModDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectCategoryDto } from './create-project-category.dto';

export class UpdateProjectCategoryDto extends PartialType(CreateProjectCategoryDto) {}

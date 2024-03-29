import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/utils/decorator';
import { CategoryEntity, UserEntity } from '@blog/entities';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
  @HttpCode(201)
  @CheckPolicies((ab) => ab.can(Action.Create, CategoryEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @User() user: UserEntity) {
    await this.categoryService.validCreate(createCategoryDto, user);
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, CategoryEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() { user }: { user: UserEntity },
  ) {
    await this.findCate(id).unless(user).can(Action.Update);
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, CategoryEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() { user }: { user: UserEntity }) {
    await this.findCate(id).unless(user).can(Action.Delete);
    return this.categoryService.remove(+id);
  }

  findCate(id: number) {
    return this.caslAbilityFactory.find(() => this.categoryService.findOne(+id, false));
  }
}

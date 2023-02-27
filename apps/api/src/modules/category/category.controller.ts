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
  UsePipes,
  HttpCode,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DtoValidationPipe } from '@/pipes/dto-validation/dto-validation.pipe';
import { User } from '@/utils/decorator';
import { CategoryEntity, UserEntity } from '@blog/entities';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { ForbiddenError } from '@casl/ability';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
  @HttpCode(201)
  @UsePipes(new DtoValidationPipe([CreateCategoryDto]))
  @CheckPolicies((ab) => ab.can(Action.Create, CategoryEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
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
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, CategoryEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() { user }: { user: UserEntity },
  ) {
    await this.findCate(id).unless(user).can(Action.Update);
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, CategoryEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string | number, @Request() { user }: { user: UserEntity }) {
    await this.findCate(id).unless(user).can(Action.Delete);
    return this.categoryService.remove(+id);
  }
  findCate(id: string | number) {
    let _user: UserEntity;
    const can = async (action: Action, field?: keyof CategoryEntity) => {
      const cate = await this.categoryService.findOne(+id, false);

      const ab = this.caslAbilityFactory.createForUser(_user);
      ForbiddenError.from(ab).throwUnlessCan(action, cate, field);

      return cate;
    };
    const unless = (loginUser: UserEntity) => {
      _user = loginUser;
      return { can };
    };

    return { unless };
  }
}

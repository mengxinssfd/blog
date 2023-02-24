import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/utils/decorator';
import { DtoValidationPipe } from '@/pipes/dto-validation/dto-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { TagEntity, UserEntity } from '@blog/entities';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { ForbiddenError } from '@casl/ability';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
  @UsePipes(new DtoValidationPipe([CreateTagDto]))
  @CheckPolicies((ab) => ab.can(Action.Create, TagEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Post()
  async create(@Body() createTagDto: CreateTagDto, @User() user: UserEntity) {
    await this.tagService.validCreate(createTagDto, user);
    return this.tagService.create(createTagDto, user);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, TagEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() { user }: { user: UserEntity },
  ) {
    await this.findTag(id).unless(user).can(Action.Update);
    return this.tagService.update(+id, updateTagDto);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, TagEntity.modelName))
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() { user }: { user: UserEntity }) {
    await this.findTag(id).unless(user).can(Action.Delete);
    return this.tagService.remove(+id);
  }
  findTag(id: string | number) {
    let _user: UserEntity;
    const can = async (action: Action, field?: keyof TagService) => {
      const cate = await this.tagService.findOne(+id);

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

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/utils/decorator';
import { AuthGuard } from '@nestjs/passport';
import { TagEntity, UserEntity } from '@blog/entities';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.findOne(id);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, TagEntity.modelName))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
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
  async remove(@Param('id', ParseIntPipe) id: number, @Request() { user }: { user: UserEntity }) {
    await this.findTag(id).unless(user).can(Action.Delete);
    return this.tagService.remove(+id);
  }

  findTag(id: number) {
    return this.caslAbilityFactory.find(() => this.tagService.findOne(+id, false));
  }
}

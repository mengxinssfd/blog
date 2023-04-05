import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendLinkService } from './friend-link.service';
import { CreateFriendLinkDto } from '@blog/dtos/friend-link/create-friend-link.dto';
import { UpdateFriendLinkDto } from '@blog/dtos/friend-link/update-friend-link.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@/utils/decorator';
import { FriendLinkEntity, UserEntity } from '@blog/entities';
import { AdjudgeFriendLinkDto, FindAllFriendLinkDto } from '@blog/dtos';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';

@ApiTags('friend-link')
@Controller('friend-link')
export class FriendLinkController {
  constructor(
    private readonly friendLinkService: FriendLinkService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFriendLinkDto: CreateFriendLinkDto, @User('id') userId: number) {
    return this.friendLinkService.create(createFriendLinkDto, userId);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Get()
  findAll(@Query() query: FindAllFriendLinkDto) {
    return this.friendLinkService.findAll(query);
  }

  @Get('resolve')
  findResolveAll() {
    return this.friendLinkService.findResolveAll();
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFriendLinkDto: UpdateFriendLinkDto,
    @User() user: UserEntity,
  ) {
    await this.casl
      .find(() => this.friendLinkService.findOne(id))
      .unless(user)
      .can(Action.Update);

    return this.friendLinkService.update(id, updateFriendLinkDto, user);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Patch('adjudge/:id')
  adjudge(@Param('id', ParseIntPipe) id: number, @Body() data: AdjudgeFriendLinkDto) {
    return this.friendLinkService.adjudge(id, data);
  }
}

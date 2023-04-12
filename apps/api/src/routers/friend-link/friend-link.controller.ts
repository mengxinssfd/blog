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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/utils/decorator';
import { FriendLinkEntity, UserEntity } from '@blog/entities';
import { AdjudgeFriendLinkDto, FindAllFriendLinkDto } from '@blog/dtos';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { JwtAuth } from '@/guards/auth/public.decorator';

@ApiTags('friend-link')
@Controller('friend-link')
export class FriendLinkController {
  constructor(
    private readonly friendLinkService: FriendLinkService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
  @JwtAuth()
  @Post()
  create(@Body() createFriendLinkDto: CreateFriendLinkDto, @User('id') userId: number) {
    return this.friendLinkService.create(createFriendLinkDto, userId);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Get()
  findAll(@Query() query: FindAllFriendLinkDto) {
    return this.friendLinkService.findAll(query);
  }

  @Get('resolve')
  findResolveAll() {
    return this.friendLinkService.findResolveAll();
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.findOne(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
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

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.remove(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity))
  @Patch('adjudge/:id')
  adjudge(@Param('id', ParseIntPipe) id: number, @Body() data: AdjudgeFriendLinkDto) {
    return this.friendLinkService.adjudge(id, data);
  }
}

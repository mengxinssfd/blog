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
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { AppPuppeteerService } from '@/modules/puppeteer/puppeteer.service';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { PageDto } from '@blog/dtos/page.dto';

@ApiTags('friend-link')
@Controller('friend-link')
export class FriendLinkController {
  constructor(
    private readonly friendLinkService: FriendLinkService,
    private readonly casl: CaslAbilityFactory,
    private readonly puppeteerService: AppPuppeteerService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(ThrottlerBehindProxyGuard)
  @Throttle(5, 60)
  @Post()
  async create(@Body() dto: CreateFriendLinkDto) {
    return this.friendLinkService.create(dto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Patch('refresh/:id')
  async refresh(@Param('id', ParseIntPipe) id: number) {
    const link = await this.friendLinkService.findOne(id);
    const url = new URL(link.link);
    const siteInfo = await this.puppeteerService.getSiteInfoWithScreenshotUrl(
      link.link,
      `site_screenshot_${url.host.replace(/[.:]/g, '_')}`,
    );
    const fl = new FriendLinkEntity();
    Object.assign(fl, siteInfo, { id });
    return fl.save();
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity.modelName))
  @Get()
  findAll(@Query() query: FindAllFriendLinkDto) {
    return this.friendLinkService.findAll(query);
  }

  @Get('resolve')
  findResolveAll() {
    return this.friendLinkService.findResolveAll();
  }
  @Get('resolve/recent')
  findRecentResolveAll(@Query() dto: PageDto) {
    return this.friendLinkService.findRecentResolveAll(dto);
  }

  @Get('apply')
  findApplyAll(@Query() dto: PageDto) {
    return this.friendLinkService.findApplyAll(dto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity.modelName))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.findOne(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity.modelName))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFriendLinkDto: UpdateFriendLinkDto,
    @User() user: UserEntity,
  ) {
    const entity = await this.casl
      .find(() => this.friendLinkService.findOne(id))
      .unless(user)
      .can(Action.Update);

    return this.friendLinkService.update(entity, updateFriendLinkDto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity.modelName))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendLinkService.remove(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, FriendLinkEntity.modelName))
  @Patch('adjudge/:id')
  adjudge(@Param('id', ParseIntPipe) id: number, @Body() data: AdjudgeFriendLinkDto) {
    return this.friendLinkService.adjudge(id, data);
  }
}

import { Body, Controller, Get, Post, Query, UseGuards, Headers } from '@nestjs/common';
import { CreateCommentDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Device, ReqIp, User } from '@/utils/decorator';
import { CommentEntity } from '@blog/entities';
import { PageDto } from '@blog/dtos/page.dto';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { Ip2RegionService } from '@/modules/ip2region/ip2region.service';
import { SaysService } from '@/routers/comment/says.service';
import { CommentService } from '@/routers/comment/comment.service';

@ApiTags('comment-says')
@Controller('comment-says')
export class SaysController {
  constructor(
    private readonly saysService: SaysService,
    private readonly ip2RegionService: Ip2RegionService,
    private readonly commentService: CommentService,
  ) {}

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, CommentEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Post()
  async create(
    @Body() dto: CreateCommentDto,
    @User('id') userId: number,
    @ReqIp() ip: string,
    @Device() device: { os: string; browser: string },
    @Headers('user-agent') ua: string,
  ) {
    const comment = new CommentEntity();

    comment.scope = 'says';
    comment.userId = userId;
    comment.ip = ip;
    comment.region = this.ip2RegionService.searchRawRegion(ip);
    comment.os = device.os;
    comment.browser = device.browser;
    comment.ua = (ua || '').slice(0, 500); // ua可能伪造，导致长度特别长

    await this.commentService.create(dto, comment);
  }

  @Get()
  findAll(@Query() dto: PageDto) {
    return this.saysService.findAll(dto);
  }
}

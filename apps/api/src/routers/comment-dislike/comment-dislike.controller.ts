import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PageDto } from '@blog/dtos/page.dto';
import { ReqIp, User } from '@/utils/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../comment/comment.service';
import { CommentDislikeService } from './comment-dislike.service';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { CommentDislikeEntity, UserEntity } from '@blog/entities';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('comment-dislike')
@Controller('comment-dislike')
export class CommentDislikeController {
  constructor(
    private readonly likeService: CommentDislikeService,
    private readonly commentService: CommentService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 1 分钟内向单个端点发出来自同一 IP 的 10 个请求
  @Throttle(10, 60)
  @Post(':commentId')
  async setLike(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
    @ReqIp() ip: string,
  ) {
    await this._valid(commentId).unless(user).can(Action.Create);
    return this.likeService.setCommentDislike(user.id, ip, commentId);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get('my')
  findMyAll(@Query() pageDto: PageDto, @User('id') userId: number) {
    return this.likeService.findMyAll(userId, pageDto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get()
  findAll(@Query() pageDto: PageDto) {
    return this.likeService.findAll(pageDto);
  }

  @Get('count/:commentId')
  countByComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User('id') userId: number,
    @ReqIp() ip: string,
  ) {
    return this.likeService.countByWhere({ userId, touristIp: ip }, { commentId });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.likeService.findOne(id);
  }

  private _valid(commentId: number) {
    return this.casl.find(async () => {
      const comment = await this.commentService.findOne(commentId);
      const dislike = new CommentDislikeEntity();
      dislike.comment = comment;
      dislike.commentId = commentId;
      return dislike;
    });
  }
}

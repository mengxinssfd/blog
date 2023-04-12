import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CommentLikeService } from './comment-like.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { PageDto } from '@blog/dtos/page.dto';
import { CommentService } from '../comment/comment.service';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { CommentDislikeEntity, UserEntity } from '@blog/entities';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('comment-like')
@Controller('comment-like')
export class CommentLikeController {
  constructor(
    private readonly likeService: CommentLikeService,
    private readonly commentService: CommentService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 1 分钟内向单个端点发出来自同一 IP 的 10 个请求
  @Throttle(10, 60)
  @Post('/:commentId')
  async setLike(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
    @ReqIp() ip: string,
  ) {
    await this._valid(commentId).unless(user).can(Action.Update);
    return this.likeService.setCommentLike(commentId, ip, user.id);
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
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(+id);
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

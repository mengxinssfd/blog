import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CommentLikeService } from './comment-like.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { PageDto } from '@blog/dtos/page.dto';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { UserEntity } from '@blog/entities';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('comment-like')
@Controller('comment-like')
export class CommentLikeController {
  constructor(private readonly likeService: CommentLikeService) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 1 分钟内向单个端点发出来自同一 IP 的 10 个请求
  @Throttle(10, 60)
  @Post('/:commentId')
  async setLike(
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
    @ReqIp() ip: string,
  ) {
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
}

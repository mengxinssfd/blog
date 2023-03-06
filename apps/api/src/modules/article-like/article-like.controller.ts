import { Controller, Get, Param, UseGuards, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { ArticleLikeService } from './article-like.service';
import { ArticleService } from '../article/article.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { PageDto } from '@blog/dtos/page.dto';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';

@ApiTags('article-like')
@Controller('article-like')
export class ArticleLikeController {
  constructor(
    private readonly likeService: ArticleLikeService,
    private readonly articleService: ArticleService,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  @Throttle(10, 60)
  @Patch(':id')
  async setLike(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @ReqIp() ip: string,
  ) {
    const article = await this.articleService.findOneBase(id);
    return this.likeService.setArticleLike(article.id, ip, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyAll(@Query() pageDto: PageDto, @User('id') userId: number) {
    return this.likeService.findAllByUserId(userId, pageDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pageDto: PageDto) {
    return this.likeService.findAll(pageDto);
  }

  @Get('count/:articleId')
  countByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @User('id') userId: number,
    @ReqIp() ip: string,
  ) {
    return this.likeService.countByWhere({ userId, touristIp: ip }, { articleId });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.likeService.findOne(id);
  }
}

import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleLikeService } from './article-like.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { PageDto } from '@blog/dtos/page.dto';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { ArticleLikeEntity, UserEntity } from '@blog/entities';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { ArticleService } from '@/routers/article/article.service';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('article-like')
@Controller('article-like')
export class ArticleLikeController {
  constructor(
    private readonly likeService: ArticleLikeService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly articleService: ArticleService,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  @Throttle(10, 60)
  @Patch(':articleId')
  async setLike(
    @Param('articleId', ParseIntPipe) articleId: number,
    @ReqIp() ip: string,
    @User() user: UserEntity,
  ) {
    const like = await this.valid(ip, articleId, user.id).unless(user).can(Action.Create);
    return this.likeService.setArticleLike(like);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get('my')
  findMyAll(@Query() pageDto: PageDto, @User('id') userId: number) {
    return this.likeService.findAllByUserId(userId, pageDto);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, ArticleLikeEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
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

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, ArticleLikeEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.likeService.delete(id);
  }

  private valid(ip: string, articleId: number, userId?: number) {
    return this.caslAbilityFactory.find(async () => {
      const article = await this.articleService.findOne(articleId);

      const newLike = new ArticleLikeEntity();
      if (userId) newLike.userId = userId;
      else newLike.touristIp = ip;
      newLike.articleId = articleId;

      const like = await this.likeService.findSelfOne(newLike).catch(() => newLike);

      like.articleId = articleId;
      like.article = article;
      return like;
    });
  }
}

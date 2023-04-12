import { Controller, Get, UseGuards } from '@nestjs/common';
import { ArticleService } from '@/routers/article/article.service';
import { UserService } from '@/routers/user/user.service';
import { CommentService } from '@/routers/comment/comment.service';
import { ArticleLikeService } from '@/routers/article-like/article-like.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RbacGuard } from '@/guards/rbac/rbac.guard';
import { ROLE } from '@blog/entities';
import { JwtAuth } from '@/guards/auth/public.decorator';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly UserService: UserService,
    private readonly CommentService: CommentService,
    private readonly ArticleLikeService: ArticleLikeService,
  ) {}

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @Get()
  async getStatistics() {
    const article = await this.articleService.getTotal();
    const user = await this.UserService.getTotal();
    const comment = await this.CommentService.getTotal();
    const articleLike = await this.ArticleLikeService.getTotal();
    return {
      article,
      user,
      comment,
      articleLike,
    };
  }
}

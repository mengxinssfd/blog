import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { CommentEntity, UserEntity } from '@blog/entities';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { PageDto } from '@blog/dtos/page.dto';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/public.decorator';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 60s 内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post()
  async create(@Body() dto: CreateCommentDto, @User('id') userId: number, @ReqIp() ip: string) {
    const user = userId
      ? await this.userService.findOne({ id: userId, addSelect: ['user.muted AS `user_muted`'] })
      : null;
    const comment = await this._validCreate(dto, user, ip)
      .unless(user || new UserEntity())
      .can(Action.Create);
    return this.commentService.create(dto, comment);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get('article/:articleId')
  findAllByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @User('id') userId: number,
    @ReqIp() ip: string,
  ) {
    return this.commentService.findAllByArticle(articleId, ip, userId);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get('reply')
  getReplyMeAll(@User('id') userId: number, @Query() pageDto: PageDto) {
    return this.commentService.findReplyMeAll(userId, pageDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.commentService.findOne(+id);
  }

  /*  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }*/

  @ApiBearerAuth()
  @JwtAuth()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
    await this._valid(id).unless(user).can(Action.Delete);
    return this.commentService.remove(+id);
  }

  private _validCreate(dto: CreateCommentDto, user: UserEntity | null, ip: string) {
    return this.casl.find(async () => {
      const article = await this.articleService.findOne(dto.articleId);

      const comment = new CommentEntity();
      comment.article = article;
      comment.articleId = article.id;
      if (user?.id) {
        comment.user = user;
        comment.userId = user.id;
      } else {
        const count = await this.commentService.count({
          touristIp: ip,
          articleId: dto.articleId,
        });
        if (count >= 5) throw new ForbiddenException('在该文章内评论次数过多,请注册登录后再评论');
        comment.touristIp = ip;
        comment.touristName = dto.touristName as string;
      }

      return comment;
    });
  }
  private _valid(id: number) {
    return this.casl.find(() => this.commentService.findOne(id));
  }
}

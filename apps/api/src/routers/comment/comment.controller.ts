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
  Headers,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Device, ReqIp, User } from '@/utils/decorator';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { CommentEntity, UserEntity } from '@blog/entities';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { PageDto } from '@blog/dtos/page.dto';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { MailService } from '@/modules/mail/mail.service';
import { Ip2RegionService } from '@/modules/ip2region/ip2region.service';
import { IsNull } from 'typeorm';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
    private readonly casl: CaslAbilityFactory,
    private readonly mailService: MailService,
    private readonly ip2RegionService: Ip2RegionService,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 60s 内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post()
  async create(
    @Body() dto: CreateCommentDto,
    @User('id') userId: number,
    @ReqIp() ip: string,
    @Device() device: { os: string; browser: string },
    @Headers('user-agent') ua: string,
  ) {
    const user = userId
      ? await this.userService.findOne({ id: userId, addSelect: ['user.muted'] })
      : null;
    const comment = await this._validCreate(dto, user, ip)
      .unless(user || new UserEntity())
      .can(Action.Create);

    comment.scope = dto.scope || null;
    comment.region = this.ip2RegionService.searchRawRegion(ip);
    comment.os = device.os;
    comment.browser = device.browser;
    comment.ua = (ua || '').slice(0, 500); // ua可能伪造，导致长度特别长

    const res = await this.commentService.create(dto, comment);

    this.commentService.findOneFull(res.id).then((c) => this.mailService.onCommentCreated(c));
  }

  @CheckPolicies((ab) => ab.can(Action.Manage, CommentEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Get()
  findAll(@Query() dto: PageDto) {
    return this.commentService.findAll(dto);
  }

  @Get('recent/:count')
  findRecent(
    @User('id') userId: number,
    @ReqIp() ip: string,
    @Param('count', ParseIntPipe) count: number,
  ) {
    return this.commentService.findRecent(ip, userId, count);
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
      const comment = new CommentEntity();
      comment.ip = ip;

      if (user?.id) {
        comment.user = user;
        comment.userId = user.id;
      } else {
        const count = await this.commentService.count({
          ip,
          userId: IsNull(),
          articleId: dto.articleId || IsNull(),
          scope: dto.scope || IsNull(),
        });
        if (count >= 5) throw new ForbiddenException('在该文章内评论次数过多,请注册登录后再评论');
        comment.touristName = dto.touristName as string;
        dto.touristEmail && (comment.touristEmail = dto.touristEmail);
      }

      if (dto.articleId) {
        const article = await this.articleService.findOne(dto.articleId, ['article.as']);
        comment.article = article;
        comment.articleId = article.id;
      } else {
        comment.articleId = null;
      }

      return comment;
    });
  }
  private _valid(id: number) {
    return this.casl.find(() => this.commentService.findOne(id));
  }
}

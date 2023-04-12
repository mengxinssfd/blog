import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto, ArticleListDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { IsFromWX, User } from '@/utils/decorator';
import { TagService } from '../tag/tag.service';
import { castArray } from '@tool-pack/basic';
import { PageDto } from '@blog/dtos/page.dto';
import { ArticleEntity, UserEntity } from '@blog/entities';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { JwtAuth } from '@/guards/auth/public.decorator';

@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  // todo 是否应该用casl校验
  async validateUserAndTags(dto: CreateArticleDto, user: any) {
    dto.tags = castArray(dto.tags).filter((i) => i);
    // 校验用户
    await this.userService.findOneById(user.id);

    // 校验分类
    await this.categoryService.findOne(dto.categoryId);

    // 校验标签
    const tags = await this.tagService.findByIds(dto.tags);

    // 文章必须要有一个标签
    if (!tags.length) throw new ForbiddenException('文章必须要有一个标签');

    // 返回不存在的标签
    if (tags.length < dto.tags.length) {
      const notFount = dto.tags.filter((id) => !tags.some((it) => it.id === id));
      throw new NotFoundException(`标签id${JSON.stringify(notFount)}不存在`);
    }
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, ArticleEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto, @User() user: any) {
    await this.validateUserAndTags(createArticleDto, user);
    // 保存文章
    return await this.articleService.create(createArticleDto, user);
  }

  @Get()
  async findAll(
    @Query() listDTO: ArticleListDto,
    @User('id') userId: number,
    @IsFromWX() isFromWX: boolean,
  ) {
    if (isFromWX) {
      const cate = await this.categoryService.findOneByName('生活').catch(() => null);
      if (cate) return this.articleService.findAll(listDTO, userId, { cateId: cate.id });
    }
    return this.articleService.findAll(listDTO, userId);
  }

  @Get('author/:authorId')
  findAllByAuthor(
    @Query() pageDto: PageDto,
    @Param('authorId', ParseIntPipe) authorId: number,
    @User('id') userId: number,
  ) {
    return this.articleService.findAllByAuthor(pageDto, +authorId, userId);
  }
  @Get('like-user/:id')
  findAllByLikeUser(@Query() pageDto: PageDto, @Param('id') userId: number) {
    return this.articleService.findAllByLikeUser(pageDto, userId);
  }

  @Get('comment-user/:id')
  findAllByCommentUser(@Query() pageDto: PageDto, @Param('id', ParseIntPipe) userId: number) {
    return this.articleService.findAllByCommentUser(pageDto, userId);
  }

  // about
  @Get('about')
  about() {
    return this.articleService.about();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
    let article: ArticleEntity;

    try {
      article = await this.find(id).unless(user).can(Action.Read);
    } catch (e) {
      if (e instanceof ForbiddenError && e.message === '文章不存在') {
        throw new NotFoundException(e.message);
      }
      throw e;
    }

    article.content = this.articleService.markedRender(article.content);
    if (user?.id !== article.authorId && article.status === ArticleEntity.STATE.public) {
      article.viewCount++;
      await this.articleService.updateViewCount(article);
    }

    return article;
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, ArticleEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Get('raw/:id')
  findOneRaw(@Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
    return this.find(id).unless(user).can(Action.Update);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, ArticleEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @User() user: UserEntity,
  ) {
    await this.validateUserAndTags(updateArticleDto as CreateArticleDto, user);

    await this.find(id).unless(user).can(Action.Update);

    // 保存文章
    return this.articleService.update(id, updateArticleDto);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, ArticleEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() { user }: { user: UserEntity }) {
    await this.find(id).unless(user).can(Action.Delete);
    return this.articleService.remove(id);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, ArticleEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: number, @Request() { user }: { user: UserEntity }) {
    await this.find(id).unless(user).can(Action.Update);
    return this.articleService.restore(id);
  }

  // 文章评论锁
  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, ArticleEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Post('mute/:articleId')
  async mute(@Param('articleId', ParseIntPipe) id: number, @User() user: UserEntity) {
    const article = await this.find(id).unless(user).can(Action.Update, 'commentLock');
    return this.articleService.mute(article);
  }

  find(id: number) {
    return this.caslAbilityFactory.find(() => this.articleService.findOne(id));
  }
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ARTICLE_STATE, CategoryEntity, ROLE, UserEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { rawsToEntities } from '@/utils/assemblyEntity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, loginUser: UserEntity) {
    // 检查分类是否已经存在
    const find = await this.categoryRepository.findOneBy({ name: createCategoryDto.name });
    if (find) throw new ForbiddenException(`分类'${createCategoryDto.name}'已存在`);

    // 非superAdmin每分钟最多只能创建5个
    if (loginUser.role !== ROLE.superAdmin) {
      const [[latest], count] = await this.categoryRepository
        .createQueryBuilder('cate')
        .where({ createBy: loginUser.id })
        .orderBy('createAt', 'DESC')
        .limit(5)
        .getManyAndCount();

      // 如果创建数量超过5个，则必须大于1分钟间隔后才能再次创建
      if (latest && count === 5) {
        const diff = Date.now() - latest.createAt.getTime();
        if (diff < 1000 * 60) throw new ForbiddenException('分类创建过于频繁');
      }
    }

    const c = new CategoryEntity();
    c.createById = loginUser.id;
    Object.assign(c, createCategoryDto);

    await this.categoryRepository.save(c);
  }

  async findAll() {
    const rep = this.categoryRepository
      .createQueryBuilder('cate')
      .leftJoin('cate.articleList', 'article')
      // .addSelect(['COUNT(article.id) as `cate_count`'])
      .addSelect([
        `SUM(CASE WHEN \`article\`.\`status\` = '${ARTICLE_STATE.public}' THEN 1 ELSE 0 END) AS \`cate_articleCount\``,
      ])
      .groupBy('cate.id');

    const raws = await rep.getRawMany();

    return rawsToEntities<CategoryEntity>({
      entityName: 'cate',
      rawList: raws,
      valueToNumArr: ['cate_articleCount'],
    });
  }

  async findAllAndArticle() {
    const res = await this.categoryRepository
      .createQueryBuilder('cate')
      .leftJoinAndSelect('cate.author', 'author')
      .select()
      .getManyAndCount();
    return {
      category: res[0],
      count: res[1],
    };
  }

  async findOne(id: number) {
    const findCate = await this.categoryRepository.findOneBy({ id });
    if (!findCate) throw new NotFoundException('该分类不存在');
    return findCate;
  }
  async findOneByName(name: string) {
    const findCate = await this.categoryRepository.findOneBy({ name });
    if (!findCate) throw new NotFoundException('该分类不存在');
    return findCate;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const c = new CategoryEntity();
    c.id = id;
    Object.assign(c, updateCategoryDto);
    return c.save();
  }

  remove(id: number) {
    return this.categoryRepository.softDelete(id);
  }
}

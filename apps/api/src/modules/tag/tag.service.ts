import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ROLE, TagEntity, UserEntity } from '@blog/entities';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}
  async validCreate(createTagDto: CreateTagDto, loginUser: UserEntity) {
    // 检查分类是否已经存在
    const find = await this.tagRepository.findOneBy({ name: createTagDto.name });
    if (find) throw new ForbiddenException(`标签'${createTagDto.name}'已存在`);

    // 非superAdmin每分钟最多只能创建5个
    if (loginUser.role !== ROLE.superAdmin) {
      const [[latest], count] = await this.tagRepository
        .createQueryBuilder('tag')
        .where({ createById: loginUser.id })
        .orderBy('createAt', 'DESC')
        .limit(5)
        .getManyAndCount();

      // 如果创建数量超过5个，则必须大于1分钟间隔后才能再次创建
      if (latest && count === 5) {
        const diff = Date.now() - latest.createAt.getTime();
        if (diff < 1000 * 60) throw new ForbiddenException('标签创建过于频繁');
      }
    }
  }
  async create(createTagDto: CreateTagDto, loginUser: UserEntity) {
    const tag = new TagEntity();
    tag.createById = loginUser.id;
    Object.assign(tag, createTagDto);
    const res = await this.tagRepository.save(tag);
    return { id: res.id };
  }

  async findAll() {
    const res = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.articleList', 'article')
      .getMany();

    res.forEach((item) => {
      item.articleCount = item.articleList?.length || 0;
      delete item.articleList;
    });

    return res;
  }

  async findOne(id: number, withCreator = true) {
    const builder = this.tagRepository
      .createQueryBuilder('tag')
      .where({ id })
      .leftJoinAndSelect('tag.articleList', 'article');

    if (withCreator) builder.leftJoinAndSelect('tag.createBy', 'user');

    const tag = await builder.getOne();
    if (!tag) throw new NotFoundException(`该标签不存在`);
    tag.articleCount = tag.articleList?.length || 0;

    return tag;
  }

  async findByIds(ids: number[]) {
    return this.tagRepository.findBy({ id: In(ids) });
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    const tag = new TagEntity();
    tag.id = id;
    Object.assign(tag, updateTagDto);
    return tag.save();
  }

  async remove(id: number) {
    const tag = new TagEntity();
    tag.id = id;
    await this.tagRepository.remove(tag);
  }
}

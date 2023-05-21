import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateFriendLinkDto,
  AdjudgeFriendLinkDto,
  FindAllFriendLinkDto,
  CreateFriendLinkDto,
} from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendLinkEntity, FriendLinkState } from '@blog/entities';
import { PageDto } from '@blog/dtos/page.dto';

type K = `fl.${keyof FriendLinkEntity}`;

@Injectable()
export class FriendLinkService {
  constructor(
    @InjectRepository(FriendLinkEntity)
    private readonly repository: Repository<FriendLinkEntity>,
  ) {}

  async findByLink(link: string) {
    return await this.repository.findOne({ where: { link } });
  }

  async create(dto: CreateFriendLinkDto) {
    const fl = new FriendLinkEntity();
    fl.link = dto.link;
    fl.avatar = dto.link + '/favicon.ico';
    fl.name = '';
    const find = await this.findByLink(dto.link);
    if (find) {
      throw new BadRequestException('网站链接已存在');
    }
    return await this.repository.save(fl);
  }

  async findAll(query: FindAllFriendLinkDto) {
    const sql = this.repository
      .createQueryBuilder('fl')
      .addSelect([
        'fl.createAt',
        'fl.status',
        'fl.rejectReason',
        'fl.updateAt',
        'fl.applyDesc',
      ] satisfies K[]);
    if (query.status) {
      sql.where({ status: query.status });
    }
    const [list, count] = await sql.getManyAndCount();
    return { list, count };
  }

  async findResolveAll() {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .addSelect(['fl.createAt'] satisfies K[])
      .where({ status: String(FriendLinkState.resolve) })
      .getManyAndCount();
    return { list, count };
  }

  async findRecentResolveAll({ page, pageSize }: PageDto) {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .addSelect(['fl.createAt'] satisfies K[])
      .where({ status: String(FriendLinkState.resolve) })
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('fl.createAt' satisfies K, 'DESC')
      .getManyAndCount();
    return { list, count };
  }

  async findApplyAll({ page, pageSize }: PageDto) {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .addSelect(['fl.applyDesc', 'fl.createAt'] satisfies K[])
      .where({ status: String(FriendLinkState.padding) })
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('fl.createAt' satisfies K, 'DESC')
      .getManyAndCount();
    return { list, count };
  }

  async findOne(id: number) {
    const res = await this.repository.findOne({ where: { id } });

    if (!res) throw new NotFoundException(`id(${id})不存在`);

    return res;
  }

  async update(entity: FriendLinkEntity, dto: UpdateFriendLinkDto) {
    Object.assign(entity, dto);
    return await this.repository.save(entity);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }
  async adjudge(id: number, data: AdjudgeFriendLinkDto) {
    const entity = new FriendLinkEntity();
    entity.id = id;
    if (data.status !== FriendLinkState.reject) {
      entity.rejectReason = '';
    }
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateFriendLinkDto,
  AdjudgeFriendLinkDto,
  FindAllFriendLinkDto,
  ActiveFriendLinkDto,
} from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendLinkEntity, FRIEND_LINK_STATE } from '@blog/entities';
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

  async create(entity: FriendLinkEntity) {
    const find = await this.findByLink(entity.link);
    if (find) {
      throw new BadRequestException('网站链接已存在');
    }
    return await this.repository.save(entity);
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
        'fl.email',
      ] satisfies K[])
      .orderBy('fl.updateAt' satisfies K, 'DESC');
    if (query.status) {
      sql.where({ status: query.status });
    }
    const [list, count] = await sql.getManyAndCount();
    return { list, count };
  }

  async findResolveAll(active = true) {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .addSelect(['fl.createAt'] satisfies K[])
      .where({ status: String(FRIEND_LINK_STATE.resolve), active })
      .getManyAndCount();
    return { list, count };
  }

  async findRecentResolveAll({ page, pageSize }: PageDto) {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .addSelect(['fl.createAt'] satisfies K[])
      .where({ status: String(FRIEND_LINK_STATE.resolve) })
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
      .where({ status: String(FRIEND_LINK_STATE.padding) })
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('fl.createAt' satisfies K, 'DESC')
      .getManyAndCount();
    return { list, count };
  }

  async findOne(id: number, addSelect: K[] = []) {
    const res = await this.repository
      .createQueryBuilder('fl')
      .addSelect(addSelect)
      .where({ id })
      .getOne();

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
    if (data.status !== FRIEND_LINK_STATE.reject) {
      entity.rejectReason = '';
    }
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }
  async setActive(id: number, data: ActiveFriendLinkDto) {
    const entity = new FriendLinkEntity();
    entity.id = id;
    entity.active = data.active;
    return await this.repository.save(entity);
  }
}

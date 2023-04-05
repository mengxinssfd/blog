import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateFriendLinkDto,
  UpdateFriendLinkDto,
  AdjudgeFriendLinkDto,
  FindAllFriendLinkDto,
} from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE, UserEntity, FriendLinkEntity, FriendLinkState } from '@blog/entities';
import { rawsToEntities } from '@/utils/assemblyEntity';

@Injectable()
export class FriendLinkService {
  constructor(
    @InjectRepository(FriendLinkEntity)
    private readonly repository: Repository<FriendLinkEntity>,
  ) {}

  async create(createFriendLinkDto: CreateFriendLinkDto, userId: number) {
    const find = await this.repository
      .createQueryBuilder('link')
      .where({ name: createFriendLinkDto.name })
      .orWhere({ link: createFriendLinkDto.link })
      .getOne();
    if (find) {
      if (find.link === createFriendLinkDto.link) {
        throw new BadRequestException('网站链接已存在');
      } else {
        throw new BadRequestException('名称已存在');
      }
    }
    const e = new FriendLinkEntity();
    Object.assign(e, createFriendLinkDto);
    e.createBy = userId;
    return await this.repository.save(e);
  }

  async findAll(query: FindAllFriendLinkDto) {
    const sql = this.repository
      .createQueryBuilder('fl')
      .addSelect([
        '`fl`.`createAt` AS `fl_createAt`',
        '`fl`.`status` AS `fl_status`',
        '`fl`.`rejectReason` AS `fl_rejectReason`',
      ]);
    if (query.status) {
      sql.where({ status: query.status });
    }
    const rawList = await sql.getRawMany();

    const list = rawsToEntities({ entityName: 'fl', rawList });

    return { list, count: list.length };
  }
  async findResolveAll() {
    const [list, count] = await this.repository
      .createQueryBuilder('fl')
      .where({ status: String(FriendLinkState.resolve) })
      .getManyAndCount();
    return { list, count };
  }

  async findOne(id: number) {
    const res = await this.repository.findOne({ where: { id } });

    if (!res) throw new NotFoundException(`id(${id})不存在`);

    return res;
  }

  async update(id: number, updateFriendLinkDto: UpdateFriendLinkDto, user: UserEntity) {
    const rep = this.repository.createQueryBuilder('fl').where({ id });
    const f = user.role === ROLE.superAdmin ? rep.withDeleted() : rep;
    const find = await f.getOne();
    if (!find) {
      throw new NotFoundException(`id:${id}不存在`);
    }
    if (!(user.role === ROLE.superAdmin || user.id === find.createBy)) {
      throw new ForbiddenException('无权修改');
    }
    // 编辑后改为待审状态
    const entity = new FriendLinkEntity();
    Object.assign(entity, updateFriendLinkDto);
    entity.id = id;
    entity.status = FriendLinkState.padding;
    return await this.repository.save(entity);
  }

  async remove(id: number) {
    return await this.repository.softDelete(id);
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

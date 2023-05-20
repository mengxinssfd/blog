import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { rawsToEntities } from '@/utils/assemblyEntity';
import { MemoryHelperEntity, ROLE, UserEntity, MEMORY_STATUS } from '@blog/entities';
import { CreateMemoryHelperDto, MemoryListDTO, UpdateMemoryHelperDto } from '@blog/dtos';
import { PageVo } from '@blog/dtos/page.vo';

type Prop<Alias extends string = 'memory'> = `${Alias}.${keyof MemoryHelperEntity}`;

@Injectable()
export class MemoryHelperService {
  constructor(
    @InjectRepository(MemoryHelperEntity)
    private readonly repository: Repository<MemoryHelperEntity>,
  ) {}
  create(createMemoryHelperDto: CreateMemoryHelperDto, creatorId: number) {
    const entity = new MemoryHelperEntity();
    Object.assign(entity, createMemoryHelperDto);
    entity.creatorId = creatorId;

    return entity.save();
  }

  async findAll(
    { page = 1, pageSize = 10 }: MemoryListDTO,
    { id: userId = 0, role = ROLE.commonUser }: UserEntity = {} as UserEntity,
  ): Promise<PageVo<MemoryHelperEntity>> {
    const alias = 'memory';
    const sort = { sort: `${alias}.updateAt`, order: 'DESC' };

    const getList = this.repository.manager.createQueryBuilder();

    const rep = getList
      .from((qb) => {
        qb.select([
          '*',
          `ROW_NUMBER() OVER (ORDER BY ${sort.sort} ${sort.order}, ${alias}.id) AS rowid`,
        ]).from(MemoryHelperEntity, alias);
        if (role > ROLE.admin) {
          qb.where({ status: String(MEMORY_STATUS.Public) }).orWhere({
            creatorId: userId,
          });
        }
        return qb;
      }, alias)
      .innerJoinAndMapOne(
        alias + '.creator',
        UserEntity,
        'creator',
        `${alias}.creatorId = creator.id`,
      )
      .addSelect([
        `${alias}.id`,
        `${alias}.title`,
        // `${alias}.questionJson AS ${alias}_questionJson`,
        `${alias}.createAt`,
        `${alias}.updateAt`,
        `${alias}.desc`,
      ] satisfies Prop[])
      .where(`${alias}.rowid between :start and :end`, {
        start: (page - 1) * pageSize + 1,
        end: page * pageSize,
      })
      .withDeleted();

    getList.expressionMap.mainAlias!.metadata = getList.connection.getMetadata(MemoryHelperEntity);

    const countRep = this.repository.createQueryBuilder(alias);

    if (role > ROLE.admin)
      countRep.where({ status: MEMORY_STATUS.Public }).orWhere({ creatorId: userId });

    const [list, count] = await Promise.all([rep.getRawMany(), countRep.getCount()]);

    const entityList = rawsToEntities<MemoryHelperEntity>({
      entityName: alias,
      rawList: list,
    });

    return { list: entityList, count };
  }

  findOne(id: number) {
    const rep = this.repository
      .createQueryBuilder('memory')
      .innerJoinAndMapOne('memory.creator', UserEntity, 'creator', 'memory.creatorId = creator.id')
      .where({ id });
    return rep.getOne();
  }
  async findOneWithoutUser(id: number) {
    const find = await MemoryHelperEntity.findOne({ where: { id } });

    if (!find) throw new NotFoundException(`ID：${id},不存在`);

    return find;
  }

  update(id: number, updateMemoryHelperDto: UpdateMemoryHelperDto) {
    return MemoryHelperEntity.update(id, { ...updateMemoryHelperDto });
  }

  remove(id: number) {
    const entity = new MemoryHelperEntity();
    entity.id = id;
    return entity.softRemove();
  }
}

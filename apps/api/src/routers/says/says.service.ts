import { Injectable } from '@nestjs/common';
import { ROLE, SaysEntity, SaysVisibleStatus, UserEntity } from '@blog/entities';
import { PageVo } from '@blog/dtos/page.vo';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateSaysDto } from '@blog/dtos';
import { PageDto } from '@blog/dtos/page.dto';

enum EntityAlias {
  user = 'user',
  says = 'says',
}

type AliasProp = `${EntityAlias.says}.${keyof SaysEntity}`;

@Injectable()
export class SaysService {
  constructor(
    @InjectRepository(SaysEntity)
    private readonly saysRepository: Repository<SaysEntity>,
  ) {}

  async create(entity: SaysEntity) {
    await this.saysRepository.save(entity);
  }

  async remove(id: number) {
    const res = await this.saysRepository.softDelete(id);
    return { affected: res.affected };
  }

  async update(id: number, dto: UpdateSaysDto) {
    await this.saysRepository.save(new SaysEntity({ id, ...dto }));
  }

  async findAll(user: UserEntity): Promise<PageVo<SaysEntity>> {
    console.log(user);
    const alias = EntityAlias.says;

    const now = new Date();
    const getComment = this.saysRepository
      .createQueryBuilder(alias)
      .addSelect(['says.createAt'] satisfies AliasProp[])
      .andWhere(
        '(says.expires >= :now OR says.expires IS NULL)' satisfies `(${AliasProp} >= :now OR ${AliasProp} IS NULL)`,
        { now },
      )
      .orderBy(`${alias}.createAt` satisfies AliasProp, 'DESC');

    if (!user.id) {
      // 枚举在数据库中是字符串
      getComment.andWhere({ visible: String(SaysVisibleStatus.Public) });
    } else if (user.role !== ROLE.superAdmin) {
      getComment.andWhere({
        visible: In(
          ([SaysVisibleStatus.Login, SaysVisibleStatus.Public] as SaysVisibleStatus[]).map(String),
        ),
      });
    }

    const [list, count] = await getComment.getManyAndCount();
    return { list, count };
  }

  async findAllByAdmin(dto: PageDto): Promise<PageVo<SaysEntity>> {
    const alias = EntityAlias.says;

    const getComment = this.saysRepository
      .createQueryBuilder(alias)
      .addSelect([
        'says.createAt',
        'says.deletedAt',
        'says.ip',
        'says.region',
        'says.browser',
        'says.os',
      ] satisfies AliasProp[])
      .orderBy(`${alias}.createAt` satisfies AliasProp, 'DESC')
      .limit(dto.pageSize)
      .offset((dto.page - 1) * dto.pageSize);

    const [list, count] = await getComment.getManyAndCount();
    return { list, count };
  }
}

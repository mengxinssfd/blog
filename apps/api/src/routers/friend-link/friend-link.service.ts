import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateFriendLinkDto, AdjudgeFriendLinkDto, FindAllFriendLinkDto } from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE, UserEntity, FriendLinkEntity, FriendLinkState } from '@blog/entities';
import { rawsToEntities } from '@/utils/assemblyEntity';
import type { BrowserContext } from 'puppeteer';
import { InjectContext } from '@mxssfd/nest-puppeteer';

@Injectable()
export class FriendLinkService {
  constructor(
    @InjectRepository(FriendLinkEntity)
    private readonly repository: Repository<FriendLinkEntity>,
    @InjectContext() private readonly browserContext: BrowserContext,
  ) {}

  async findByLink(link: string) {
    return await this.repository.findOne({ where: { link } });
  }

  async create(friendLink: FriendLinkEntity) {
    const find = await this.findByLink(friendLink.link);
    console.log('fffff', find, friendLink);
    if (find) {
      throw new BadRequestException('网站链接已存在');
    }
    return await this.repository.save(friendLink);
  }

  async findAll(query: FindAllFriendLinkDto) {
    const sql = this.repository
      .createQueryBuilder('fl')
      .addSelect([
        '`fl`.`createAt` AS `fl_createAt`',
        '`fl`.`status` AS `fl_status`',
        '`fl`.`rejectReason` AS `fl_rejectReason`',
        '`fl`.`updateAt` AS `fl_updateAt`',
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

  async fetchSiteInfo(link: string) {
    const page = await this.browserContext.newPage();
    try {
      await page.setViewport({ width: 1600, height: 900 });
      await page.goto(link, { waitUntil: 'networkidle2' });
      await page.content();
      const info = await page.evaluate(() => {
        return {
          name: document.title,
          desc:
            (document.querySelector('meta[name=description]') as HTMLMetaElement)?.content || '',
          avatar:
            (
              document.querySelector(
                'link[rel="icon"],link[rel^="icon "],link[rel$=" icon"]',
              ) as HTMLLinkElement
            )?.href || '',
        } satisfies Pick<FriendLinkEntity, 'name' | 'desc' | 'avatar'>;
      });

      const screenshot = await page.screenshot({ encoding: 'binary' });
      return { ...info, screenshot };
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      await page.close();
    }
  }
}

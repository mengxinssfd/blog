import { Repository } from 'typeorm';
import { forEachObj } from '@tool-pack/basic';
import { BaseLikeEntity } from '@blog/entities/src/base-like.entity';

export class BaseLikeService<T extends BaseLikeEntity> {
  constructor(readonly likeRepository: Repository<T>) {}

  async getTotal() {
    const alias = 'like';
    return await this.likeRepository
      .createQueryBuilder(alias)
      .select([
        `COUNT(${alias}.id) AS total`,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NOT NULL THEN 1 ELSE 0 END) AS \`delete\``,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NULL THEN 1 ELSE 0 END) AS \`common\``,
      ])
      .withDeleted()
      .getRawOne();
  }

  findOneByEntity(like: T) {
    return this.likeRepository.findOne({
      select: ['id', 'deletedAt'],
      where: like as any,
      withDeleted: true,
    });
  }

  async setLike(like: T, ip: string, userId?: number) {
    if (userId) {
      like.userId = userId;
    } else {
      like.touristIp = ip;
    }
    const liked = await this.findOneByEntity(like);
    if (liked) {
      if (liked.deletedAt) {
        await this.likeRepository.restore(liked.id);
      } else {
        await this.likeRepository.softRemove(liked);
      }
    } else {
      await this.update(like);
    }
  }

  async countByWhere(like: Partial<T>, where: any) {
    const { userId, touristIp: ip } = like;
    const alias = 'like';
    const checkedSelect = userId
      ? `SUM(CASE WHEN ${alias}.userId = ${userId} THEN 1 ELSE 0 END ) AS checked`
      : `SUM(CASE WHEN ${alias}.touristIp = '${ip}' THEN 1 ELSE 0 END ) AS checked`;
    const query = this.likeRepository
      .createQueryBuilder(alias)
      .select([`COUNT(${alias}.id) as count`, checkedSelect])
      .where(where);
    const countAndHasLike = await query.getRawOne();
    forEachObj(countAndHasLike, (v, k, obj) => {
      obj[k] = Number(v);
    });
    return countAndHasLike;
  }

  update(like: T) {
    return this.likeRepository.save(like);
  }
}

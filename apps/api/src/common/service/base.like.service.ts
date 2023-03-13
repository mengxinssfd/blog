import { Repository } from 'typeorm';
import { replaceValues } from '@tool-pack/basic';
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

  async setLike(like: T) {
    if (like.id) {
      if (like.deletedAt) await this.likeRepository.restore(like.id);
      else await this.likeRepository.softRemove(like);
    } else {
      await this.likeRepository.save(like);
    }
  }

  async countByWhere(
    like: Partial<T>,
    where: Partial<T>,
  ): Promise<{ count: number; checked: 0 | 1 }> {
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
    return replaceValues(countAndHasLike, Number);
  }

  update(like: T) {
    return this.likeRepository.save(like);
  }

  async delete(id: number) {
    const { affected } = await this.likeRepository.delete(id);
    return { affected };
  }
}

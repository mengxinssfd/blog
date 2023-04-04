import { Injectable } from '@nestjs/common';
import { PageDto } from '@blog/dtos/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLikeEntity } from '@blog/entities';
import { BaseLikeService } from '@/common/service/base.like.service';

@Injectable()
export class CommentLikeService extends BaseLikeService<CommentLikeEntity> {
  constructor(
    @InjectRepository(CommentLikeEntity)
    override readonly likeRepository: Repository<CommentLikeEntity>,
  ) {
    super(likeRepository);
  }
  // 我的点赞列表
  async findMyAll(userId: number, pageDto: PageDto) {
    const getList = await this.likeRepository
      .createQueryBuilder('commentLike')
      .select()
      .where({ userId })
      .leftJoinAndSelect('commentLike.user', 'user')
      .leftJoinAndSelect('commentLike.comment', 'comment')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize);
    const list = await getList.getMany();
    return list;
  }
  // 全部user的点赞列表
  async findAll(pageDto: PageDto) {
    const list = await this.likeRepository
      .createQueryBuilder('commentLike')
      .select()
      .leftJoinAndSelect('commentLike.user', 'user')
      .leftJoinAndSelect('commentLike.comment', 'comment')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize)
      .getMany();

    return list;
  }

  async findOne(id: number) {
    const res = await this.likeRepository.findOne({
      where: { id },
      select: ['id', 'userId', 'commentId'],
    });
    return res;
  }

  async setCommentLike(commentId: number, ip: string, userId: number) {
    const like = new CommentLikeEntity();
    like.touristIp = ip;
    like.userId = userId;
    like.commentId = commentId;
    await this.setLike(like);
    return this.countByWhere(like, { commentId });
  }
}

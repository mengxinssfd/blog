import { Injectable } from '@nestjs/common';
import { PageDto } from '@blog/dtos/page.dto';
import { CommentEntity } from '@blog/entities';
import { PageVo } from '@blog/dtos/page.vo';
import { CommentService } from '@/routers/comment/comment.service';

enum EntityAlias {
  comment = 'comment',
  user = 'user',
  reply = 'reply',
}
type AliasProp = `${EntityAlias.comment}.${keyof CommentEntity}`;

@Injectable()
export class SaysService {
  constructor(private readonly commentService: CommentService) {}

  async findAll(dto: PageDto): Promise<PageVo<CommentEntity>> {
    const alias = EntityAlias.comment;
    const getComment = this.commentService.createFindAllBuilder('', 1);

    getComment.andWhere({ scope: 'says' });

    // 只返回一个月内的说说
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    getComment.andWhere('comment.createAt >= :time' satisfies `${AliasProp} >= :time`, {
      time: lastMonth,
    });

    const getCount = getComment.clone();
    getComment
      .orderBy(`${alias}.createAt` satisfies AliasProp, 'DESC')
      .limit(dto.pageSize)
      .offset((dto.page - 1) * dto.pageSize)
      .addSelect(['comment.touristEmail', 'comment.ip'] satisfies AliasProp[]);

    const count = await getCount.getCount();
    let list: CommentEntity[] = [];

    if (count)
      list = this.commentService.handlerFindAllResult(await getComment.getRawMany(), false).list;

    return { list, count };
  }
}
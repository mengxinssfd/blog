import { BlogBaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

export enum SaysVisibleStatus {
  Public,
  Login,
  Private,
}

@Entity({ name: 'says' })
export class SaysEntity extends BlogBaseEntity {
  static readonly modelName = 'SaysEntity' as const;
  static readonly VISIBLE_STATUS = SaysVisibleStatus;

  constructor(partial?: Partial<SaysEntity>) {
    super();
    partial && Object.assign(this, partial);
  }

  @Column({
    type: 'text',
    comment: '说说内容',
    charset: 'utf8mb4',
  })
  content!: string;

  @Column('varchar', {
    length: 45,
    comment: 'ip',
    nullable: true,
    select: false,
  })
  ip!: string | null;

  @Column('varchar', {
    length: 100,
    comment: '地区',
    nullable: true,
  })
  region!: string | null;

  @Column('varchar', {
    length: 50,
    comment: '浏览器',
    nullable: true,
  })
  browser!: string | null;

  @Column('varchar', {
    length: 50,
    comment: '系统',
    nullable: true,
  })
  os!: string | null;

  @Column('varchar', {
    length: 500,
    comment: '浏览器的user-agent',
    nullable: true,
    select: false,
  })
  ua!: string | null;

  @Column('enum', {
    enum: SaysVisibleStatus,
    comment: `可见状态：${SaysVisibleStatus.Public} 公开，${SaysVisibleStatus.Login} 需要登录, ${SaysVisibleStatus.Private} 只能自己看`,
    default: SaysVisibleStatus.Public,
  })
  visible!: SaysVisibleStatus;

  @Column('datetime', { nullable: true, comment: `过期时间` })
  expires!: Date | null;
}

/*

-- 从评论表迁移到说说表

-- 将数据插入到说说表中
INSERT INTO says (content, ip, createAt, updateAt, region, browser, os, ua)
SELECT content,
       ip,
       createAt,
       updateAt,
       region,
       browser,
       os,
       ua
FROM comment
where scope = 'says'
  and parentId is NULL
  and replyId is NULL
  and deletedAt is null;

-- 更新子评论的 scope 字段，将其设置为 'says' + 说说表的 id，同时确保子评论的 parentId 与父评论的 id 匹配
-- 替换scope
UPDATE comment AS child
    JOIN comment AS parent ON child.parentId = parent.id
    JOIN says ON parent.content = says.content
SET child.scope    = CONCAT('says/', says.id)
WHERE child.parentId IS NOT NULL
  and child.scope = 'says';

-- 根元素移除parentId和replyId
UPDATE comment AS child
SET
    child.parentId = null,
    child.replyId  = null
WHERE child.parentId IS NOT NULL
  and child.parentId = child.replyId
  and child.scope like 'says/%';

-- 子评论
UPDATE comment AS child
    JOIN comment AS reply ON child.replyId = reply.id
SET child.parentId    = child.replyId
WHERE child.replyId IS NOT NULL
  and reply.parentId is NULL
  and child.scope like 'says/%';

-- 回复
UPDATE comment AS child
    JOIN comment AS reply ON child.replyId = reply.id
    JOIN comment AS parent ON child.parentId = parent.id
SET child.parentId    = reply.parentId
WHERE child.replyId IS NOT NULL
  and parent.scope = 'says'
  and child.scope like 'says/%';

-- 删除已迁移的数据
DELETE
FROM comment
WHERE scope = 'says'
  and parentId is NULL
  and replyId is NULL;

 
*/

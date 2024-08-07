import { Column, Entity, Index } from 'typeorm';
import { BlogBaseEntity } from './base.entity';
import { USER_DEFAULT_AVATAR, USER_ROLE, USER_STATE } from './constant';

export class PublicUser extends BlogBaseEntity {
  static readonly DEFAULT_AVATAR = USER_DEFAULT_AVATAR;
  static readonly ROLE = USER_ROLE;
  static readonly USER_STATE = USER_STATE;

  static override readonly modelName = 'UserEntity' as const;

  @Column('varchar', {
    comment: '用户名',
    length: 12,
    unique: true,
    select: false,
  })
  username!: string;

  @Column('varchar', { length: 24, comment: '昵称', unique: true })
  nickname!: string;

  @Column('varchar', {
    comment: 'email',
    length: 254,
    default: '',
    select: false,
  })
  email!: string;

  @Column('varchar', {
    length: 500,
    comment: 'avatar',
    default: USER_DEFAULT_AVATAR,
  })
  avatar!: string;

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 15,
    comment: '手机号码',
    select: false,
  })
  mobile!: string;

  @Column('enum', {
    comment: '用户角色：0-超级管理员|1-管理员|2-开发&测试&运营|3-普通用户（只能查看）',
    enum: USER_ROLE,
    default: USER_ROLE.commonUser,
    select: false,
  })
  role!: USER_ROLE;

  @Column('enum', {
    comment: '状态：0-失效|1-有效|2-删除',
    enum: USER_STATE,
    default: USER_STATE.valid,
    select: false,
  })
  status!: USER_STATE;

  @Column('smallint', { comment: '创建人ID', default: 0, select: false })
  createBy!: number;

  @Column('boolean', {
    comment: '是否禁言',
    default: false,
    select: false,
  })
  muted!: boolean;

  // 更新时间
  @Column('datetime', {
    comment: '登录时间',
    nullable: true,
    select: false,
  })
  loginAt?: Date | string;
}

@Entity({ name: 'user' })
export class UserEntity extends PublicUser {
  @Column('varchar', { length: 32, comment: '加盐密码', select: false })
  password!: string;

  // 加密盐
  @Column('varchar', {
    length: 6,
    comment: '加密盐',
    select: false,
  })
  salt!: string;

  @Column('int', { comment: '修改人ID', nullable: true, select: false })
  updateBy!: number;

  // DESC user;
  // ALTER TABLE user MODIFY COLUMN IP VARCHAR(45);
  @Column('varchar', {
    length: 45,
    comment: '账号登录时ip',
    nullable: true,
    select: false,
  })
  loginIp!: string;
  @Column('varchar', {
    length: 45,
    comment: '账号注册时ip',
    nullable: true,
    select: false,
  })
  registerIp!: string;

  @Column('varchar', {
    length: 50,
    comment: '微信小程序openid',
    nullable: true,
    select: false,
  })
  openid!: string;
}

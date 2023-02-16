import { Column, Entity, Index } from 'typeorm';
import { BlogBaseEntity } from './base.entity';

const DefaultAvatar =
  'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/20201103002944_c9ed4.jpeg';

export enum ROLE {
  superAdmin,
  admin,
  dev, // 开发运营测试
  commonUser,
}
export enum USER_STATE {
  invalid,
  valid,
}

export class PublicUser extends BlogBaseEntity {
  static readonly DEFAULT_AVATAR = DefaultAvatar;
  static readonly ROLE = ROLE;
  static readonly USER_STATE = USER_STATE;

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
    default: DefaultAvatar,
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
    enum: ROLE,
    default: ROLE.commonUser,
    select: false,
  })
  role!: ROLE;

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
  loginAt?: Date;
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

  @Column('varchar', {
    length: '255,255,255,255'.length,
    comment: '账号登录时ip',
    nullable: true,
    select: false,
  })
  loginIp!: string;
  @Column('varchar', {
    length: '255,255,255,255'.length,
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

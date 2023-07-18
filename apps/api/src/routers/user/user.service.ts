import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '@blog/dtos/user/update-user.dto';
import { encryptPassword, makeSalt } from '@/utils/cryptogram';
import { RegisterDTO } from '@blog/dtos/user/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE, USER_STATE, UserEntity } from '@blog/entities';
import { UpdatePasswordDto } from '@blog/dtos/user/update-password.dto';
import FailedException from '@/exceptions/Failed.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  saveLoginInfo(id: number, ip: string) {
    const user = new UserEntity();
    user.id = id;
    user.loginIp = ip;
    user.loginAt = new Date();
    this.repository.save(user);
  }

  async getTotal() {
    const alias = 'user';
    return await this.repository
      .createQueryBuilder(alias)
      .select([
        `COUNT(${alias}.id) as total`,
        `SUM(CASE WHEN \`${alias}\`.\`status\` = '${USER_STATE.valid}' THEN 1 ELSE 0 END) AS \`valid\``,
        `SUM(CASE WHEN \`${alias}\`.\`status\` = '${USER_STATE.invalid}' THEN 1 ELSE 0 END) AS \`invalid\``,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NOT NULL  THEN 1 ELSE 0 END) AS \`delete\``,
      ])
      .withDeleted()
      .getRawOne();
  }

  async getSelf(id: number) {
    const find = await this.repository.findOne({
      where: { id },
      select: ['id', 'username', 'nickname', 'role', 'avatar', 'email'],
    });
    if (!find) throw new NotFoundException('账号不存在');

    return find;
  }

  async register(requestBody: RegisterDTO, ip: string, loginUser?: UserEntity) {
    const { username, nickname, password, mobile, email } = requestBody;
    const user = await this.findOne({
      username,
      nickname,
      mobile,
    });
    if (user) {
      let msg = '用户已存在';
      if (mobile && user.mobile === mobile) {
        msg = '手机号已注册';
      } else if (user.username === username) {
        msg = '用户名已存在';
      } else if (user.nickname === nickname) {
        msg = '昵称已存在';
      }
      throw new FailedException(msg);
    }

    if (!loginUser || loginUser.role !== ROLE.superAdmin) {
      const ipCount = await this.repository.count({
        where: { registerIp: ip },
      });
      if (ipCount >= 5) {
        throw new ForbiddenException('创建账号太多');
      }
    }

    const salt = makeSalt(); // 制作密码盐
    const hashPwd = encryptPassword(password, salt);

    const _user = new UserEntity();
    _user.username = username;
    _user.nickname = nickname;
    _user.password = hashPwd;
    _user.salt = salt;
    mobile && (_user.mobile = mobile);
    email && (_user.email = email);
    _user.registerIp = ip;
    loginUser && (_user.createBy = loginUser.id);

    const entity = await this.repository.save(_user);

    if (entity.id === 1) {
      entity.role = ROLE.superAdmin;
      await this.repository.save(entity);
    }
    return { id: entity.id };
  }

  async findAll() {
    const [list, count] = await this.repository
      .createQueryBuilder('user')
      .addSelect([
        'user.deletedAt',
        'user.loginIp',
        'user.registerIp',
        'user.role',
        'user.loginAt',
        'user.createAt',
        'user.muted',
        'user.username',
        'user.email',
        'user.mobile',
      ] satisfies `user.${keyof UserEntity}`[])
      .withDeleted()
      .getManyAndCount();
    return { list, count };
  }

  async findOneById(id: number | string, userId?: number) {
    if (id !== id) throw new FailedException('id错误！');
    const select = ['user.id', 'user.nickname', 'user.role', 'user.avatar', 'user.loginAt'];
    if (userId === id) {
      select.push(...['user.mobile', 'user.email']);
    }
    const repo = this.repository.createQueryBuilder('user').where({ id }).select(select);

    const find = await repo.getOne();

    if (!find) {
      throw new NotFoundException('用户不存在');
    }

    return find;
  }

  findOne({
    id,
    username,
    mobile,
    nickname,
    addSelect = [],
  }: {
    id?: number | string;
    nickname?: string;
    username?: string;
    mobile?: string | undefined;
    addSelect?: `user.${keyof UserEntity}`[];
  }): Promise<UserEntity | null> {
    let rep = this.repository
      .createQueryBuilder('user')
      .addSelect([
        'user.salt',
        'user.password',
        'user.updateAt',
        'user.mobile',
        'user.deletedAt',
        'user.role',
        ...addSelect,
      ] satisfies `user.${keyof UserEntity}`[])
      .where({ username })
      .orWhere({ nickname })
      .orWhere({ id });

    if (mobile) {
      rep = rep.orWhere({ mobile });
    }
    return rep.getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = new UserEntity();
    Object.assign(user, updateUserDto);
    user.id = id;
    user.updateBy = id;
    return await this.repository.save(user);
  }

  async updatePassword(updateDto: UpdatePasswordDto, user: UserEntity, loginUser: UserEntity) {
    const { password } = updateDto;
    // if (password !== rePassword) throw new FailedException('两次密码输入不一样');

    const salt = makeSalt(); // 制作新的密码盐
    const hashPwd = encryptPassword(password, salt);

    user.salt = salt;
    user.updateBy = loginUser.id;
    user.password = hashPwd;
    await this.repository.save(user);
  }

  async delete(id: number) {
    await this.repository.delete(id);
  }

  async remove(id: number) {
    await this.repository.softDelete(id);
  }

  async setRole(id: number | string, role: ROLE) {
    const user = new UserEntity();
    user.id = +id;
    user.role = role;
    const updatedUser = await user.save();
    return updatedUser.role;
  }

  async setMute(id: number, mute: boolean, loginUser: UserEntity) {
    const user = new UserEntity();
    user.id = id;
    user.muted = mute;
    user.updateBy = loginUser.id;
    await user.save();
  }
  async restore(id: number) {
    await this.repository.restore(id);
  }

  async findOneByOpenId(openid: string) {
    const rep = this.repository
      .createQueryBuilder('user')
      .addSelect([
        'user.salt AS `user_salt`',
        'user.password AS `user_password`',
        'user.updateAt AS `user_updateAt`',
        'user.mobile AS `user_mobile`',
        'user.deletedAt AS `user_deletedAt`',
        'user.role AS `user_role`',
      ])
      .where({ openid });
    return rep.getOne();
  }
}

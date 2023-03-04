import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../../../../../packages/dtos/src/user/update-user.dto';
import { encryptPassword, makeSalt } from '@/utils/cryptogram';
import { RegisterDTO } from '../../../../../packages/dtos/src/user/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE, USER_STATE, UserEntity } from '@blog/entities';
import { UpdatePasswordDto } from '../../../../../packages/dtos/src/user/update-password.dto';
import { httpsGet } from '@/utils/utils';
import { WxLoginDTO } from '../../../../../packages/dtos/src/user/wx-login.dto';
import { createUUID } from '@tool-pack/basic';
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
      select: ['id', 'username', 'nickname', 'role', 'avatar'],
    });
    if (!find) {
      throw new NotFoundException('账号不存在');
    }
    return find;
  }

  async register(requestBody: RegisterDTO, ip: string, loginUser?: UserEntity) {
    const { username, nickname, password, mobile } = requestBody;
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
    _user.email = '';
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
      ])
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
  }: {
    id?: number | string;
    nickname?: string;
    username?: string;
    mobile?: string | undefined;
  }): Promise<UserEntity | null> {
    let rep = this.repository
      .createQueryBuilder('user')
      .addSelect([
        'user.salt AS `user_salt`',
        'user.password AS `user_password`',
        'user.updateAt AS `user_updateAt`',
        'user.mobile AS `user_mobile`',
        'user.deletedAt AS `user_deletedAt`',
        'user.role AS `user_role`',
      ])
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

  private async setMute(id: number, mute: boolean, loginUser: UserEntity) {
    const user = new UserEntity();
    user.id = id;
    user.muted = mute;
    user.updateBy = loginUser.id;
    await user.save();
  }

  async mute(id: number, loginUser: UserEntity) {
    return this.setMute(id, true, loginUser);
  }
  async cancelMute(id: number, loginUser: UserEntity) {
    return this.setMute(id, false, loginUser);
  }
  async restore(id: number) {
    await this.repository.restore(id);
  }

  async getMiniProgramUserinfo({ code }: WxLoginDTO) {
    interface FAIL {
      errcode: number;
      errmsg: string;
    }

    const APPID = process.env['MINI_PROGRAM_APPID'];
    const SECRET = process.env['MINI_PROGRAM_SECRET'];

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;

    // 获取小程序用户的session_key和openid
    const res = await httpsGet<{
      code: number;
      msg: string;
      data:
        | FAIL
        | {
            session_key: string;
            openid: string;
          };
    }>(url);

    // session_key: 'CozKggznZDjmgOI2kOn2dA==',
    // o05rH5SrFg91oIQf-e_EXNlrXGow
    // openid: 'o05rH5SrFg91oIQf-e_EXNlrXGow'
    // console.log('res', res);

    // 一个code只能用一次
    if ('errmsg' in res.data) throw new FailedException((res.data as FAIL).errmsg);

    return res.data;

    // const pc = new WXBizDataCrypt(APPID, res.data.session_key);
    //
    // const data = pc.decryptData(encryptedData, iv);
    //
    // // console.log('解密后 data: ', data);
    //
    // return { ...data, ...res.data };
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

  async registerWithMiniProgramUser(
    // data: Awaited<
    //   ReturnType<typeof UserService['prototype']['getMiniProgramUserinfo']>
    // >,
    data: WxLoginDTO & { session_key: string; openid: string },
  ) {
    const password = createUUID();
    const salt = makeSalt(); // 制作密码盐
    const hashPwd = encryptPassword(password, salt);

    const user = new UserEntity();
    user.username = (data.nickName + '_wwwwwwwwwwx').substring(0, 12);
    user.nickname = data.nickName;
    user.avatar = data.avatarUrl;
    user.password = hashPwd;
    user.salt = salt;
    user.email = '';
    user.openid = data.openid;

    return await this.repository.save(user);
  }
  async updateMiniProgramUser(user: UserEntity, data: WxLoginDTO) {
    user.nickname = data.nickName;
    user.avatar = data.avatarUrl;
    return await this.repository.save(user);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { encryptPassword } from '@/utils/cryptogram';
import { PublicUser, UserEntity } from '@blog/entities';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  findUser({
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
    let rep = UserEntity.getRepository()
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

  // JWT验证 - Step 2: 校验用户信息
  async validateUser(
    findUserCondition: {
      id?: number | string;
      nickname?: string;
      username?: string;
      mobile?: string;
    },
    password: string,
  ): Promise<UserEntity> {
    console.log('JWT验证 - Step 2: 校验用户信息');
    const user = await this.findUser(findUserCondition);

    // 用户不存在
    if (!user) throw new UnauthorizedException('查无此人');

    const hashedPassword = user.password;
    const salt = user.salt;
    const hashPassword = encryptPassword(password, salt);

    // 密码错误
    if (hashedPassword !== hashPassword) throw new UnauthorizedException('账号或密码不正确');

    return user;
  }

  // JWT验证 - Step 3: 处理 jwt 签证
  certificate(user: PublicUser) {
    const payload = {
      username: user.username,
      id: user.id,
      role: user.role,
    };
    console.log('JWT验证 - Step 3: 处理 jwt 签证');
    return this.jwtService.sign(payload);
  }
}

import { Injectable } from '@nestjs/common';
import { WxLoginDTO } from '@blog/dtos';
import FailedException from '@/exceptions/Failed.exception';
import { AppConfigService } from '@/app.config.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@/utils/log4js';
import { createUUID } from '@tool-pack/basic';
import { encryptPassword, makeSalt } from '@/utils/cryptogram';
import { UserEntity } from '@blog/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WechatMiniProgramService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getUserinfo({ code, nickName }: WxLoginDTO) {
    interface FAIL {
      errcode: number;
      errmsg: string;
    }

    Logger.info('准备微信登录:', nickName);

    const { appid, secret } = this.configService.val('wechatMiniProgram');

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    // 获取小程序用户的session_key和openid
    const res = await this.httpService.axiosRef.get<
      | FAIL
      | {
          session_key: string;
          openid: string;
        }
    >(url);

    // session_key: 'CozKggznZDjmgOI2kOn2dA==',
    // o05rH5SrFg91oIQf-e_EXNlrXGow
    // openid: 'o05rH5SrFg91oIQf-e_EXNlrXGow'
    // console.log('res', res);

    // 一个code只能用一次
    if ('errmsg' in res.data) {
      Logger.info('微信登录失败:', nickName);
      throw new FailedException((res.data as FAIL).errmsg);
    }

    Logger.info('微信登录成功:', nickName);
    return res.data;

    // const pc = new WXBizDataCrypt(APPID, res.data.session_key);
    //
    // const data = pc.decryptData(encryptedData, iv);
    //
    // // console.log('解密后 data: ', data);
    //
    // return { ...data, ...res.data };
  }

  async register(
    // data: Awaited<
    //   ReturnType<typeof UserService['prototype']['getMiniProgramUserinfo']>
    // >,
    data: WxLoginDTO & { session_key: string; openid: string; ip: string },
  ) {
    const password = createUUID();
    const salt = makeSalt(); // 制作密码盐
    const hashPwd = encryptPassword(password, salt);

    const user = new UserEntity();
    user.username = (data.nickName + '_wechat').substring(0, 12);
    user.nickname = data.nickName;
    user.avatar = data.avatarUrl;
    user.password = hashPwd;
    user.salt = salt;
    user.email = '';
    user.openid = data.openid;
    user.registerIp = data.ip;

    return await this.userRepo.save(user);
  }

  async updateUser(user: UserEntity, data: WxLoginDTO) {
    user.nickname = data.nickName;
    user.avatar = data.avatarUrl;
    return await this.userRepo.save(user);
  }
}

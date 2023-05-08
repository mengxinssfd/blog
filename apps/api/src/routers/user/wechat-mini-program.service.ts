import { Injectable } from '@nestjs/common';
import { WxLoginDTO } from '@blog/dtos';
import FailedException from '@/exceptions/Failed.exception';
import { AppConfigService } from '@/app.config.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@/utils/log4js';

@Injectable()
export class WechatMiniProgramService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getUserinfo({ code }: WxLoginDTO) {
    interface FAIL {
      errcode: number;
      errmsg: string;
    }

    Logger.info('准备微信登录');

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
}

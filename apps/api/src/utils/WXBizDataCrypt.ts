import * as crypto from 'crypto';

export interface WxUserInfo {
  avatarUrl: string;
  city: string;
  country: string;
  gender: number;
  language: string;
  nickName: string;
  province: string;
}
/**
 * 微信小程序用户信息解密工具
 */
export default class WXBizDataCrypt {
  constructor(private appId: string, private sessionKey: string) {}
  decryptData(encryptedDataStr: string, ivStr: string): WxUserInfo {
    // base64 decode
    const sessionKey = new Buffer(this.sessionKey, 'base64');
    const encryptedData = new Buffer(encryptedDataStr, 'base64');
    const iv = new Buffer(ivStr, 'base64');

    let decoded;
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedData as any, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      console.log(err);
      throw new Error('Illegal Buffer');
    }

    if (decoded.watermark.appid !== this.appId) {
      throw new Error('Illegal Buffer');
    }

    return decoded;
  }
}

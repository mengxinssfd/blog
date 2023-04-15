import * as OSS from 'ali-oss';
import type { Configuration } from '@/config/configuration';
import { Logger } from '@/utils/log4js';

const prefix = 'store/';
export class OssHelper {
  private oss!: OSS;
  constructor(config: Configuration['oss']) {
    this.oss = new OSS(config);
  }

  /**
   * 上传文件
   * @param localPath
   * @param ossPath
   * @param size
   */
  public uploadFile(ossPath: string, localPath: string, size: number) {
    if (size > 5 * 1024 * 1024) {
      // 设置MB
      return this.resumeUpload(ossPath, localPath);
    } else {
      return this.upload(ossPath, localPath);
    }
  }
  async uploadBuffer(ossPath: string, buffer: Buffer): Promise<string | void> {
    const p = prefix + ossPath;
    try {
      const res = await this.oss.put(p, buffer, {
        headers: { 'x-oss-forbid-overwrite': true }, // 禁止覆盖同名文件(经测试无用)
      });

      // 将文件设置为公共可读
      await this.oss.putACL(p, 'public-read');
      return res.url;
    } catch (e) {
      Logger.error('oss上传出错', e);
    }
  }
  /**
   * 上传文件
   * @param ossPath
   * @param stream
   */
  // public async uploadStream(ossPath: string, stream: ReadStream) {
  //   try {
  //     // 使用'chunked encoding'。使用putStream接口时，SDK默认会发起一个'chunked encoding'的HTTP PUT请求。
  //     // 填写本地文件的完整路径，从本地文件中读取数据流。
  //     // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
  //     // let stream = fs.createReadStream('D:\\localpath\\examplefile.txt');
  //     // 填写Object完整路径，例如exampledir/exampleobject.txt。Object完整路径中不能包含Bucket名称。
  //     const result = await this.oss.putStream(ossPath, stream);
  //     console.log(result);
  //     return result;
  //
  //     // 不使用'chunked encoding'。如果在options指定了contentLength参数，则不会使用chunked encoding。
  //     // let stream = fs.createReadStream('D:\\localpath\\examplefile.txt');
  //     // let size = fs.statSync('D:\\localpath\\examplefile.txt').size;
  //     // let result = await client.putStream(
  //     //   'exampledir/exampleobject.txt',
  //     //   stream,
  //     //   { contentLength: size },
  //     // );
  //     // console.log(result);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  // oss put上传文件
  private async upload(ossPath: string, localPath: string) {
    const res = await this.oss.put(ossPath, localPath);
    // 将文件设置为公共可读
    await this.oss.putACL(ossPath, 'public-read');
    return res.url;
  }
  // oss 断点上传
  private async resumeUpload(ossPath: string, localPath: string) {
    let checkpoint: any = 0;
    // 重试3次
    for (let i = 0; i < 3; i++) {
      try {
        await this.oss.multipartUpload(ossPath, localPath, {
          checkpoint,
          async progress(_percent: number, cpt: any) {
            checkpoint = cpt;
          },
        });
        // 将文件设置为公共可读
        await this.oss.putACL(ossPath, 'public-read');
        break;
      } catch (error) {
        // console.log(error)
      }
    }
  }
  /**
   * 删除一个文件
   */
  deleteOne(name: string): Promise<{ res: OSS.NormalSuccessResponse }> {
    return this.oss.delete(prefix + name) as any;
  }

  /**
   * 删除多个文件
   * @param filePathArr
   */
  deleteMulti(filePathArr: string[]) {
    return this.oss.deleteMulti(filePathArr, { quiet: true });
  }
  /**
   * 获取文件的url
   * @param filePath
   */
  getFileSignatureUrl(filePath: string) {
    return this.oss.signatureUrl(filePath, { expires: 36000 });
  }
  // 判断文件是否存在
  async exist(ossPath: string) {
    try {
      const result = await this.oss.get(ossPath);
      return result.res.status === 200;
    } catch (e) {
      return false;
    }
  }
  list() {
    return this.oss.list(null, { timeout: 5000 });
  }
}

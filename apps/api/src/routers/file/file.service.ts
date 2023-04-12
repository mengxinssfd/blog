import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { OssHelper } from '@/utils/OssHelper';
import { pickByKeys } from '@tool-pack/basic';
import { AppConfigService } from '@/app.config.service';

@Injectable()
export class FileService {
  ossHelper!: OssHelper;
  constructor(configService: AppConfigService) {
    this.ossHelper = new OssHelper(configService.val('oss'));
  }
  async uploadTest() {
    try {
      const filePath = path.resolve(
        'D:\\project\\blog-new\\back\\src\\modules\\file\\test\\logo.png',
      );
      const stat = fs.statSync(filePath);
      console.log(stat);
      const res = await this.ossHelper.uploadFile('store/logo.png', filePath, stat.size);
      console.log('file', res);
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async create(filename: string, buffer: Buffer, isUseTimeName: boolean) {
    const name = isUseTimeName ? String(Date.now()) + path.extname(filename) : filename;
    return await this.ossHelper.uploadBuffer(name, buffer);
  }

  async findAll() {
    const res = await this.ossHelper.list();
    return res.objects.map((i) => pickByKeys(i, ['name', 'url', 'lastModified', 'size']));
  }

  async remove(name: string) {
    const { res } = await this.ossHelper.deleteOne(name);
    return res.status;
  }
}

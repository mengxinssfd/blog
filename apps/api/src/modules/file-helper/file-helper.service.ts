import { Injectable } from '@nestjs/common';
import { FileEntity } from '@blog/entities';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OssService } from '@/modules/oss/oss.service';
import fs from 'fs';
import FailedException from '@/exceptions/Failed.exception';

@Injectable()
export class FileHelperService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly repository: Repository<FileEntity>,
    private readonly ossService: OssService,
  ) {}

  async uploadTest() {
    try {
      const filePath = path.resolve(
        'D:\\project\\blog-new\\back\\src\\modules\\file\\test\\logo.png',
      );
      const stat = fs.statSync(filePath);
      console.log(stat);
      const res = await this.ossService.uploadFile('store/logo.png', filePath, stat.size);
      console.log('file', res);
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  private async saveFile(
    options: Pick<FileEntity, 'filename' | 'size' | 'mimetype' | 'url' | 'ownerId'>,
  ) {
    const file =
      (await this.repository.findOne({ where: { filename: options.filename } })) ||
      new FileEntity();

    Object.assign(file, options);

    return await this.repository.save(file);
  }

  async create(buffer: Buffer, options: Pick<FileEntity, 'filename' | 'mimetype' | 'ownerId'>) {
    const url = await this.ossService.uploadBuffer(options.filename, buffer);
    this.saveFile({ ...options, size: buffer.length, url });
    return url;
  }

  async remove(id: number) {
    const find = await this.repository.findOne({ where: { id }, select: ['filename'] });
    if (!find) throw new FailedException(`id(${id})不存在`);

    this.ossService.deleteOne(find.filename);
    return await this.repository.delete(id);
  }
}

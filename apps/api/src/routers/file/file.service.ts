import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { FileHelperService } from '@/modules/file-helper/file-helper.service';
import * as Path from 'path';
import { PageDto } from '@blog/dtos/page.dto';
import { PageVo } from '@blog/dtos/page.vo';

@Injectable()
export class FileService {
  constructor(
    private readonly fileHelperService: FileHelperService,
    @InjectRepository(FileEntity)
    private readonly repository: Repository<FileEntity>,
  ) {}

  async create(
    file: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    },
    isUseTimeName: boolean,
  ) {
    const { buffer, originalname, mimetype } = file;
    const filename = decodeURIComponent(escape(originalname));
    const name = isUseTimeName ? String(Date.now()) + Path.extname(filename) : filename;
    return this.fileHelperService.create(name, buffer, mimetype);
  }

  async findAll(page: PageDto): Promise<PageVo<FileEntity>> {
    console.log(page);
    const rep = this.repository
      .createQueryBuilder('file')
      .addSelect(['file.createAt', 'file.updateAt'] satisfies `file.${keyof FileEntity}`[])
      .limit(page.pageSize)
      .offset((page.page - 1) * page.pageSize);
    const [list, count] = await rep.getManyAndCount();
    return { list, count };
  }

  async remove(id: number) {
    return this.fileHelperService.remove(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, UserEntity } from '@blog/entities';
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
    user: UserEntity,
  ) {
    const { buffer, originalname, mimetype } = file;
    const name = decodeURIComponent(escape(originalname));
    const filename = isUseTimeName ? String(Date.now()) + Path.extname(name) : name;
    return this.fileHelperService.create(buffer, { mimetype, ownerId: user.id, filename });
  }

  async findAll(page: PageDto): Promise<PageVo<FileEntity>> {
    type Props = `file.${keyof FileEntity}`;
    const rep = this.repository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.owner', 'owner')
      .addSelect('owner.username')
      .addSelect(['file.createAt', 'file.updateAt'] satisfies Props[])
      .orderBy('file.createAt' satisfies Props, 'DESC')
      .limit(page.pageSize)
      .offset((page.page - 1) * page.pageSize);
    const [list, count] = await rep.getManyAndCount();
    return { list, count };
  }

  async remove(id: number) {
    return this.fileHelperService.remove(id);
  }
}

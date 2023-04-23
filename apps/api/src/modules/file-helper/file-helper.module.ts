import { Module } from '@nestjs/common';
import { OssModule } from '@/modules/oss/oss.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '@blog/entities';
import { FileHelperService } from './file-helper.service';

@Module({
  imports: [OssModule, TypeOrmModule.forFeature([FileEntity])],
  providers: [FileHelperService],
  exports: [FileHelperService],
})
export class FileHelperModule {}

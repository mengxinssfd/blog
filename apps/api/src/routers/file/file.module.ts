import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileHelperModule } from '@/modules/file-helper/file-helper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '@blog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), FileHelperModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}

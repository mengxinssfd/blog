import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from '@blog/dtos/file/create-file.dto';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { FileEntity } from '@blog/entities';
import { JwtAuth } from '@/guards/auth/public.decorator';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, FileEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file')) // FormData中的key
  create(
    @UploadedFile()
    file: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    },
    @Body() createFileDto: CreateFileDto,
  ) {
    return this.fileService.create(
      file.originalname,
      file.buffer,
      createFileDto.timeStampName === '1',
    );
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, FileEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, FileEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.fileService.remove(name);
  }
}

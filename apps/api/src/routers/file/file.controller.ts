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
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from '@blog/dtos/file/create-file.dto';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { Action } from '@blog/permission-rules';
import { FileEntity, UserEntity } from '@blog/entities';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { PageDto } from '@blog/dtos/page.dto';
import { User } from '@/utils/decorator';

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
    file: any,
    @Body() createFileDto: CreateFileDto,
    @User() user: UserEntity,
  ) {
    return this.fileService.create(file, createFileDto.timeStampName === '1', user);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, FileEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Get()
  findAll(@Query() page: PageDto) {
    return this.fileService.findAll(page);
  }

  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, FileEntity.modelName))
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.remove(id);
  }
}

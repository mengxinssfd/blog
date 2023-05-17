import { Module } from '@nestjs/common';
import { MemoryHelperService } from './memory-helper.service';
import { MemoryHelperController } from './memory-helper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { MemoryHelperEntity, UserEntity } from '@blog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MemoryHelperEntity])],
  controllers: [MemoryHelperController],
  providers: [MemoryHelperService, UserService],
})
export class MemoryHelperModule {}

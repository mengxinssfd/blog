import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@blog/entities';
import { UserController } from './user.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { AppRedisModule } from '@/modules/redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { WechatMiniProgramService } from '@/routers/user/wechat-mini-program.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule, AppRedisModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, WechatMiniProgramService],
  exports: [UserService],
})
export class UserModule {}

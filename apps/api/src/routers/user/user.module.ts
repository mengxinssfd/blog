import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@blog/entities';
import { UserController } from './user.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { AppRedisModule } from '@/modules/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule, AppRedisModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

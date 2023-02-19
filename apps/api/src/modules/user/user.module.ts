import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@blog/entities';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [UserService, CaslAbilityFactory],
  exports: [UserService],
})
export class UserModule {}

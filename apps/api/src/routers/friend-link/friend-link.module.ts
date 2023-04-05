import { Module } from '@nestjs/common';
import { FriendLinkService } from './friend-link.service';
import { FriendLinkController } from './friend-link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendLinkEntity } from '@blog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([FriendLinkEntity])],
  controllers: [FriendLinkController],
  providers: [FriendLinkService],
})
export class FriendLinkModule {}

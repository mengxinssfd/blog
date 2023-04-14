import { Module } from '@nestjs/common';
import { FriendLinkService } from './friend-link.service';
import { FriendLinkController } from './friend-link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendLinkEntity } from '@blog/entities';
import { FileService } from '@/routers/file/file.service';
import { AppPuppeteerModule } from '@/modules/puppeteer/puppeteer.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendLinkEntity]), AppPuppeteerModule],
  controllers: [FriendLinkController],
  providers: [FriendLinkService, FileService],
})
export class FriendLinkModule {}

import { Module } from '@nestjs/common';
import { FriendLinkService } from './friend-link.service';
import { FriendLinkController } from './friend-link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendLinkEntity } from '@blog/entities';
import { AppPuppeteerModule } from '@/modules/puppeteer/puppeteer.module';
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendLinkEntity]), AppPuppeteerModule, MailModule],
  controllers: [FriendLinkController],
  providers: [FriendLinkService],
})
export class FriendLinkModule {}

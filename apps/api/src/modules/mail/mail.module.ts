import { join } from 'path';
import { Module } from '@nestjs/common';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppConfigService } from '@/app.config.service';
import { MailService } from './mail.service';
import { UserService } from '@/routers/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@blog/entities';
import { CommentTipsService } from '@/modules/mail/comment-tips.service';

// 参考文章 https://notiz.dev/blog/send-emails-with-nestjs

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MailerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory(config: AppConfigService): MailerOptions {
        return {
          // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
          // or
          // transport: {
          //   host: 'smtp.example.com',
          //   secure: false,
          //   auth: {
          //     user: 'user@example.com',
          //     pass: 'topsecret',
          //   },
          // },
          // defaults: {
          //   from: '"No Reply" <noreply@example.com>',
          // },
          ...config.val('mail'),
          template: {
            dir: join(__dirname, 'modules/mail/templates'), // 以dist的目录为准
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailService, UserService, CommentTipsService],
  exports: [MailService],
})
export class MailModule {}

import { Injectable } from '@nestjs/common';
import { CommentEntity, FriendLinkEntity } from '@blog/entities';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@/utils/log4js';
import { CommentTipsService } from '@/modules/mail/comment-tips.service';
import { AppConfigService } from '@/app.config.service';
import { FriendLinkTipsService } from '@/modules/mail/frind-link-tips.service';
import { ENV } from '@/utils/utils';

export type SendMailParams = [subject: string, to: string, template: string, context: object];

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly commentTipsService: CommentTipsService,
    private readonly friendLinkTipsService: FriendLinkTipsService,
    private readonly configService: AppConfigService,
  ) {}

  private _sendMail = async (subject: string, to: string, template: string, context: object) => {
    if (ENV.isTest()) {
      Logger.info('测试期间停止发送邮件');
      return;
    }

    if (!to) {
      Logger.info('发送邮件失败，邮件地址不能为空\n');
      return;
    }
    Logger.info('即将发送邮件给：', to);

    if (!this.configService.val('app.emailEnable')) {
      Logger.info('`app.emailEnable`未开启，停止发送');
      return;
    }

    try {
      await this.mailerService.sendMail({
        // to: user.email,
        to,
        // from: '"Support Team" <support@example.com>', // override default from
        subject, // 主题
        context, // ✏️ filling curly brackets with content
        // https://beefree.io/ 有很多好看的模板
        template, // `.hbs` extension is appended automatically
      });
    } catch (e) {
      console.log(subject, template, context, this.mailerService);
      // Logger.error('发送邮件失败', e);
    }
    Logger.info('发送邮件成功\n');
  };

  async onApplyFriendLink(friendLink: string) {
    const params = await this.friendLinkTipsService.getApplyFriendLinkParams(friendLink);
    this._sendMail(...params);
  }
  async onFriendLinkStatusChange(entity: FriendLinkEntity) {
    const params = await this.friendLinkTipsService.getFriendLinkStatusChangeParams(entity);
    this._sendMail(...params);
  }

  async onCommentCreated(comment: CommentEntity) {
    const handlers = [
      (res: Parameters<typeof this._sendMail>) => this._sendMail(...res),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ] as const;

    await this.commentTipsService
      .sendCommentTipsToReplyUser(comment, comment.reply)
      .then(...handlers);
    if (comment.replyId !== comment.parentId)
      await this.commentTipsService
        .sendCommentTipsToReplyUser(comment, comment.parent)
        .then(...handlers);
    await this.commentTipsService.sendCommentTipsToAuthor(comment).then(...handlers);
    await this.commentTipsService.sendCommentTipsToAppMaster(comment).then(...handlers);
  }
}

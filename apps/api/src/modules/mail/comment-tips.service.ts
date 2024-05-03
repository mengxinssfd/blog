import { Injectable } from '@nestjs/common';
import { CommentEntity, USER_ROLE } from '@blog/entities';
import { Logger } from '@/utils/log4js';
import { AppConfigService } from '@/app.config.service';
import { getArticleCommentLink } from '@blog/shared';
import { UserService } from '@/routers/user/user.service';

function getEmail(comment?: CommentEntity): string {
  return comment?.touristEmail || comment?.user?.email || '';
}

type Res = [subject: string, to: string, template: string, context: object];

@Injectable()
export class CommentTipsService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  async sendCommentTipsToAppMaster(comment: CommentEntity): Promise<Res> {
    if (
      comment.reply?.user?.role === USER_ROLE.superAdmin ||
      comment.article?.author.role === USER_ROLE.superAdmin ||
      comment.user?.role === USER_ROLE.superAdmin
    )
      return Promise.reject();

    const { host, name } = this.configService.val('app');
    const url = `https://${this.configService.val('app.host')}`;

    const context = {
      username: comment?.user?.nickname ?? comment?.touristName,
      url: url + getArticleCommentLink(comment),
      app_url: url,
      host: host.toUpperCase(),
      content: comment.content,
      article: comment.article?.title,
    };

    const admin = await this.userService.findOne({ id: 1, addSelect: ['user.email'] });
    const to = admin?.email || '';
    Logger.info('准备发送评论提示邮件给管理员');
    return [`『${name}』网站的文章有新的评论。`, to, './commentTipsToMaster', context];
  }

  async sendCommentTipsToAuthor(comment: CommentEntity): Promise<Res> {
    const to = comment.article?.author.email;

    // 作者回复自己
    if (!to || to === getEmail(comment)) return Promise.reject();

    // 别人回复作者，已经在回复那接收过了
    const { parent, reply } = comment;
    if ([getEmail(parent), getEmail(reply)].includes(to)) return Promise.reject();

    const { host, name } = this.configService.val('app');
    const url = `https://${this.configService.val('app.host')}`;

    const context = {
      username: comment.article?.author.nickname,
      usernameOfComment: comment?.user?.nickname ?? comment?.touristName,
      url: url + getArticleCommentLink(comment),
      app_url: url,
      host: host.toUpperCase(),
      content: comment.content,
      article: comment.article?.title,
    };

    Logger.info('准备发送评论提示邮件给作者');
    return [`你在『${name}』的文章有新的评论。`, to, './commentTipsToAuthor', context];
  }

  async sendCommentTipsToReplyUser(comment: CommentEntity, reply?: CommentEntity): Promise<Res> {
    if (!reply) return Promise.reject();

    const to = getEmail(reply);

    // 如果是回复自己，则不发送邮件
    if (getEmail(comment) === to) return Promise.reject();

    const { host, name } = this.configService.val('app');
    const url = `https://${this.configService.val('app.host')}`;

    const context = {
      // 回复对象
      usernameOfReplied: reply.user?.nickname ?? reply.touristName,
      // 回复者
      username: comment.user?.nickname ?? comment.touristName,
      url: url + getArticleCommentLink(comment),
      app_url: url,
      host: host.toUpperCase(),
      content: comment.content,
    };

    Logger.info('准备发送回复提示邮件给用户');
    return [`你在 『 ${name} 』上的留言有新的回复。`, to, './commentTipsToReplied', context];
  }
}

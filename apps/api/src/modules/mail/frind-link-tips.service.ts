import { Injectable } from '@nestjs/common';
import { Logger } from '@/utils/log4js';
import { UserService } from '@/routers/user/user.service';
import { AppConfigService } from '@/app.config.service';
import type { SendMailParams } from '@/modules/mail/mail.service';
import { FriendLinkEntity, FriendLinkState } from '@blog/entities';

@Injectable()
export class FriendLinkTipsService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  async getApplyFriendLinkParams(friendLink: string): Promise<SendMailParams> {
    const { host, name } = this.configService.val('app');
    const url = `https://${host}`;

    const context = {
      url: url + '/admin/friend-link',
      appUrl: url,
      content: friendLink,
      title: '有新的友链申请。',
    };

    const admin = await this.userService.findOne({ id: 1, addSelect: ['user.email'] });
    const to = admin?.email || '';
    Logger.info('准备发送友链申请提示邮件给管理员');
    return [`『${name}』有新的友链申请。`, to, './commonTips', context];
  }
  async getFriendLinkStatusChangeParams(entity: FriendLinkEntity): Promise<SendMailParams> {
    const { host, name } = this.configService.val('app');
    const url = `https://${host}`;

    const context = {
      url: url + '/friend-link',
      appUrl: url,
      content:
        entity.status === FriendLinkState.resolve
          ? '友链审核已通过'
          : `友链审核未通过，原因：'${entity.rejectReason}'`,
      title: '友链状态已更新。',
    };

    const to = entity.email || '';
    Logger.info('准备发送友链状态更新提示邮件给申请者');
    return [`你在『${name}』的友链状态已更新。`, to, './commonTips', context];
  }
}

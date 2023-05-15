import { Injectable } from '@nestjs/common';
import { Logger } from '@/utils/log4js';
import { UserService } from '@/routers/user/user.service';
import { AppConfigService } from '@/app.config.service';

@Injectable()
export class InitUserService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  async registerRoot() {
    const { count } = await this.userService.findAll();
    if (count) return;

    const admin = this.configService.val('admin');

    await this.userService.register({ nickname: admin.username, ...admin }, '127.0.0.1');
    Logger.info('初始账号注册成功');
  }
}

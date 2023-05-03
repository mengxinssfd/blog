import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ReqIp, User } from '@/utils/decorator';
import { UserEntity } from '@blog/entities';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import ResetTokenException from '../../exceptions/ResetToken.exception';
import { LocalAuthGuard } from '@/guards/auth/local-auth.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { Action } from '@blog/permission-rules';
import {
  AdminUpdateUserDto,
  LoginDTO,
  LoginVO,
  MuteDto,
  RegisterDTO,
  SetRoleDto,
  UpdatePasswordDto,
  UpdateUserDto,
  WxLoginDTO,
} from '@blog/dtos';
import { RequestWithUser } from '@/types';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { AppRedisService } from '@/modules/redis/redis.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly redisService: AppRedisService,
  ) {}

  @Post('miniprogram-login')
  async miniProgramLogin(@Body() data: WxLoginDTO) {
    const userInfo = await this.userService.getMiniProgramUserinfo(data);

    let user = await this.userService.findOneByOpenId(userInfo.openid);
    if (!user) {
      user = await this.userService.registerWithMiniProgramUser({
        ...userInfo,
        ...data,
      });
    } else {
      // 更新用户昵称和头像
      user = await this.userService.updateMiniProgramUser(user, data);
    }

    const token = this.authService.certificate(user);
    this.userService.saveLoginInfo(user.id, 'xcx');

    throw new ResetTokenException({ token });
  }

  @ApiCreatedResponse({
    status: 200,
    type: LoginVO,
  })
  @ApiBody({
    description: '用户登录',
    type: LoginDTO,
  })
  // 使用LocalAuthGuard登录
  @UseGuards(ThrottlerBehindProxyGuard, LocalAuthGuard)
  // 与ThrottlerBehindProxyGuard配套装饰器，可以在 1 分钟内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post('login')
  async login(@Request() { user }: RequestWithUser, @ReqIp() ip: string) {
    // 使用LocalAuthGuard代替手动登录
    /*
    console.log('JWT验证 - Step 1: 用户请求登录');

    const user = await this.authService.validateUser(
      { username: loginParams.username },
      loginParams.password,
    );
    */
    const token = this.authService.certificate(user);
    this.userService.saveLoginInfo(user.id, ip);

    throw new ResetTokenException({ token });
  }

  @Post('register')
  register(@Body() body: RegisterDTO, @ReqIp() ip: string, @User() loginUser: UserEntity) {
    return this.userService.register(body, ip, loginUser);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get('self')
  async self(@Request() { user }: RequestWithUser) {
    const nUser = await this.userService.getSelf(user.id);
    if (nUser.role !== user.role) {
      const token = this.authService.certificate(nUser);
      throw new ResetTokenException({ token, user: nUser });
    }
    return { user: nUser };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string, @User('id') userId: number) {
    return this.userService.findOneById(+id, userId);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, UserEntity.modelName))
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /*@Get(':userName')
  findOne(@Param('userName') userName: string) {
    return this.userService.findOne(userName);
  }*/

  @ApiBearerAuth()
  @JwtAuth()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
    @User() user: UserEntity,
  ) {
    await this.findUser(id).unless(user).can(Action.Update);
    return this.userService.update(+id, updateDto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, UserEntity))
  @Patch('by-admin/:id')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: AdminUpdateUserDto,
    @User() user: UserEntity,
  ) {
    return this.update(id, updateDto, user);
  }

  // TODO 限制密码错误次数
  @ApiBearerAuth()
  @JwtAuth()
  @Patch('password/:id')
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePasswordDto,
    @Request() { user }: RequestWithUser,
  ) {
    const findUser = await this.caslAbilityFactory
      .find(() => this.authService.validateUser({ id }, updateDto.curPassword))
      .unless(user)
      .can(Action.Update, 'password');
    return await this.userService.updatePassword(updateDto, findUser, user);
  }

  /**
   * 真删除
   */
  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Delete, UserEntity.modelName))
  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() { user }: RequestWithUser) {
    await this.findUser(id).unless(user).can(Action.Delete);
    return this.userService.delete(+id);
  }

  /**
   * 软删除
   */
  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Delete, UserEntity.modelName))
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() { user }: RequestWithUser) {
    // const findUser = await this.userService.findOneById(id);
    //
    // ForbiddenError.from(this.caslAbilityFactory.createForUser(user)).throwUnlessCan(
    //   Action.Delete,
    //   findUser,
    // );

    // 替换上面注释的代码
    await this.findUser(id).unless(user).can(Action.Delete);

    return this.userService.remove(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Update, UserEntity.modelName, 'role'))
  @Patch('role/:id')
  async setRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() roleDto: SetRoleDto,
    @Request() { user }: RequestWithUser,
  ) {
    const findUser = await this.findUser(id).unless(user).can(Action.Update, 'role');
    findUser.role = await this.userService.setRole(id, roleDto.role);
    // 把改了角色的账号踢下线
    this.redisService.delToken(findUser);
    // const token = this.authService.certificate(findUser);
    // throw new ResetTokenException({ token, user: findUser });
    return { role: findUser.role };
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, UserEntity, 'muted'))
  @UseGuards(PoliciesGuard)
  @Patch('mute/:id')
  async mute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MuteDto,
    @Request() { user }: RequestWithUser,
  ) {
    await this.findUser(id).unless(user).can(Action.Update, 'muted');
    return this.userService.setMute(id, dto.mute, user);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, UserEntity.modelName))
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }

  findUser(id: number) {
    return this.caslAbilityFactory.find(() => this.userService.findOneById(+id));
  }
}

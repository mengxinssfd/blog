import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { DtoValidationPipe } from '@/pipe/dto-validation/dto-validation.pipe';
import { RegisterInfoDTO } from './dto/register.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginInfoDTO, LoginResponseDTO } from './dto/login.dto';
import { ReqIp, User } from '@/utils/decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserEntity } from '@blog/entities';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { SetRoleDto } from './dto/set-role.dto';
import { WxLoginDTO } from './dto/wx-login.dto';
import ResetTokenException from '../../exceptions/ResetToken.exception';
import { LocalAuthGuard } from '@/guards/auth/local-auth.guard';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { Action, AppAbility, CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';

type RequestWithUser = Request & { user: UserEntity };

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UsePipes(new DtoValidationPipe([WxLoginDTO]))
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
    type: LoginResponseDTO,
  })
  @UsePipes(new DtoValidationPipe([LoginInfoDTO]))
  /*@ApiBody({
    description: '用户登录',
    type: LoginInfoDTO,
  })*/
  // 使用LocalAuthGuard登录
  @UseGuards(ThrottlerBehindProxyGuard, LocalAuthGuard)
  // 与ThrottlerBehindProxyGuard配套装饰器，可以在 1 分钟内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post('login')
  async login(@Request() req: { user: UserEntity }, @ReqIp() ip: string) {
    // 使用LocalAuthGuard代替手动登录
    /*
    console.log('JWT验证 - Step 1: 用户请求登录');

    const user = await this.authService.validateUser(
      { username: loginParams.username },
      loginParams.password,
    );
    */
    const token = this.authService.certificate(req.user);
    this.userService.saveLoginInfo(req.user.id, ip);

    throw new ResetTokenException({ token });
  }

  @UsePipes(new DtoValidationPipe([RegisterInfoDTO]))
  @Post('register')
  register(@Body() body: RegisterInfoDTO, @ReqIp() ip: string, @User() loginUser: UserEntity) {
    return this.userService.register(body, ip, loginUser);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('self')
  async self(@Request() { user }: { user: UserEntity }) {
    const nUser = await this.userService.getSelf(user.id);
    if (nUser.role !== user.role) {
      const token = this.authService.certificate(nUser);
      throw new ResetTokenException({ token, user: nUser });
    }
    return { user: nUser };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId: number) {
    return this.userService.findOneById(+id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
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
  @UsePipes(new DtoValidationPipe([UpdateUserDto]))
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string | number,
    @Body() updateDto: UpdateUserDto,
    @User() user: UserEntity,
  ) {
    await this.findUserUnlessCan(id, user, (er, findUser) => {
      er.throwUnlessCan(Action.Update, findUser);
    });
    return this.userService.update(+id, updateDto);
  }

  // TODO 限制密码错误次数
  @ApiBearerAuth()
  @UsePipes(new DtoValidationPipe([UpdatePasswordDto]))
  @UseGuards(JwtAuthGuard)
  @Patch('password/:id')
  async updatePassword(
    @Param('id') id: string | number,
    @Body() updateDto: UpdatePasswordDto,
    @Request() { user }: RequestWithUser,
  ) {
    const findUser = await this.authService.validateUser({ id }, updateDto.curPassword);

    ForbiddenError.from(this.caslAbilityFactory.createForUser(user)).throwUnlessCan(
      Action.Update,
      findUser,
      'password',
    );

    return await this.userService.updatePassword(updateDto, findUser, user);
  }

  /**
   * 真删除
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Delete, UserEntity.modelName))
  @Delete('delete/:id')
  async delete(@Param('id') id: string | number, @Request() { user }: RequestWithUser) {
    await this.findUserUnlessCan(id, user, (ab, findUser) =>
      ab.throwUnlessCan(Action.Delete, findUser),
    );

    return this.userService.delete(+id);
  }

  /**
   * 软删除
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Delete, UserEntity.modelName))
  @Delete(':id')
  async remove(@Param('id') id: string | number, @Request() { user }: RequestWithUser) {
    // const findUser = await this.userService.findOneById(id);
    //
    // ForbiddenError.from(this.caslAbilityFactory.createForUser(user)).throwUnlessCan(
    //   Action.Delete,
    //   findUser,
    // );

    // 替换上面注释的代码
    await this.findUserUnlessCan(id, user, (ab, findUser) =>
      ab.throwUnlessCan(Action.Delete, findUser),
    );

    return this.userService.remove(+id);
  }

  @ApiBearerAuth()
  @UsePipes(new DtoValidationPipe([SetRoleDto]))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Update, UserEntity.modelName, 'role'))
  @Patch('role/:id')
  async setRole(
    @Param('id') id: string | number,
    @Body() roleDto: SetRoleDto,
    @Request() { user }: RequestWithUser,
  ) {
    const findUser = await this.findUserUnlessCan(id, user, (ab, findUser) =>
      ab.throwUnlessCan(Action.Update, findUser, 'role'),
    );

    findUser.role = await this.userService.setRole(id, roleDto.role);

    const token = this.authService.certificate(findUser);
    throw new ResetTokenException({ token, user: findUser });
  }
  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, UserEntity, 'muted'))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch('mute/:id')
  async mute(@Param('id') id: string, @Request() { user }: { user: UserEntity }) {
    await this.findUserUnlessCan(id, user, (er, findUser) => {
      er.throwUnlessCan(Action.Update, findUser, 'muted');
    });
    return this.userService.mute(+id, user);
  }
  @ApiBearerAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, UserEntity, 'muted'))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @Patch('cancel-mute/:id')
  async cancelMute(@Param('id') id: string, @Request() { user }: { user: UserEntity }) {
    await this.findUserUnlessCan(id, user, (er, findUser) => {
      er.throwUnlessCan(Action.Update, findUser, 'muted');
    });
    return this.userService.cancelMute(+id, user);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ab) => ab.can(Action.Manage, UserEntity.modelName))
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.userService.restore(+id);
  }

  async findUserUnlessCan(
    id: number | string,
    loginUser: UserEntity,
    cb: (fbErr: ForbiddenError<AppAbility>, findUser: UserEntity) => void,
  ) {
    const user = await this.userService.findOneById(+id);

    cb(ForbiddenError.from(this.caslAbilityFactory.createForUser(loginUser)), user);

    return user;
  }
}

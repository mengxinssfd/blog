import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { DtoValidationPipe } from '@/pipe/dto-validation/dto-validation.pipe';
import { RegisterInfoDTO } from './dto/register.dto';
import { RbacInterceptor } from '@/interceptors/rbac/rbac.interceptor';
import { RbacGuard } from '@/guards/rbac/rbac.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginInfoDTO, LoginResponseDTO } from './dto/login.dto';
import { ReqIp, User } from '@/utils/decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ROLE, UserEntity } from '@blog/entities';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { SetRoleDto } from './dto/set-role.dto';
import { WxLoginDTO } from './dto/wx-login.dto';
import ResetTokenException from '../../exceptions/ResetToken.exception';
import { LocalAuthGuard } from '@/modules/auth/local-auth.guard';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
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
  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 1 分钟内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @UseGuards(LocalAuthGuard) // 使用LocalAuthGuard登录
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
  async self(@User() user: UserEntity) {
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

  @UsePipes(new DtoValidationPipe([]))
  @UseInterceptors(new RbacInterceptor(ROLE.admin))
  @UseGuards(AuthGuard('jwt'))
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
  update(
    @Param('id') id: string | number,
    @Body() updateDto: UpdateUserDto,
    @User() user: UserEntity,
  ) {
    id = +id;

    if (user.role > ROLE.superAdmin && user.id !== id)
      throw new ForbiddenException('禁止修改其他账号信息');

    return this.userService.update(id, updateDto, user);
  }

  // TODO 限制密码错误次数
  @ApiBearerAuth()
  @UsePipes(new DtoValidationPipe([UpdatePasswordDto]))
  @UseGuards(JwtAuthGuard)
  @Patch('password/:id')
  async updatePassword(
    @Param('id') id: string | number,
    @Body() updateDto: UpdatePasswordDto,
    @User() user: UserEntity,
  ) {
    id = +id;

    if (user.role > ROLE.superAdmin && user.id !== id)
      throw new ForbiddenException('禁止修改其他账号的密码');

    const findUser = await this.authService.validateUser({ id }, updateDto.curPassword);

    return await this.userService.updatePassword(id, updateDto, findUser, user);
  }

  @ApiBearerAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }

  @ApiBearerAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @ApiBearerAuth()
  @UsePipes(new DtoValidationPipe([SetRoleDto]))
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Patch('role/:id')
  setRole(@Param('id') id: string, @Body() roleDto: SetRoleDto) {
    return this.userService.setRole(+id, roleDto);
  }
  @ApiBearerAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Patch('mute/:id')
  mute(@Param('id') id: string) {
    return this.userService.mute(+id);
  }
  @ApiBearerAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Patch('cancel-mute/:id')
  cancelMute(@Param('id') id: string) {
    return this.userService.cancelMute(+id);
  }
  @ApiBearerAuth()
  @UseGuards(new RbacGuard(ROLE.superAdmin))
  @UseGuards(JwtAuthGuard)
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.userService.restore(+id);
  }
}

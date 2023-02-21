import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constats';
import { UserModule } from './user.module';
import { AuthService } from '../auth/auth.service';
import { LocalStrategy } from '../auth/local.strategy';
import { JwtStrategy } from '../auth/jwt.strategy';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '8h' }, // // token 过期时效
        }),
        UserModule,
      ],
      providers: [UserController, AuthService, LocalStrategy, JwtStrategy, UserService],
      exports: [AuthService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const body = {
      accountName: 'account test 2',
      realName: 'real name test 2',
      password: 'password',
      rePassword: 'password',
      mobile: '10086',
    };
    it('register success!"', async () => {
      const res = await controller.register(body as any, '127.0.0.0', { id: 1 } as any);
      expect(res).toEqual({ code: 200, msg: 'Success' });
    });
    it('register 手机号已注册!"', async () => {
      const res = await controller.register(
        Object.assign({}, body, { accountName: 'account test 3' }) as any,
        '127.0.0.0',
        { id: 1 } as any,
      );
      expect(res).toEqual({ code: 400, msg: '手机号已注册' });
    });
    it('register 用户已存在!"', async () => {
      const res = await controller.register(
        Object.assign({}, body, { mobile: '10000' }) as any,
        '127.0.0.0',
        { id: 1 } as any,
      );
      expect(res).toEqual({ code: 400, msg: '用户已存在' });
    });
  });
  describe('login', () => {
    const body: any = {
      username: 'javascript',
      password: '123456',
    };
    it('login success!"', async () => {
      const res = await controller.login({ user: body } as any, '127.0.0.0');
      expect(res).toBe(undefined);
    });
  });
});

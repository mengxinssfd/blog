import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('UserService', () => {
    it('find success', async () => {
      const user = await service.findOne({ username: 'javascript' });
      expect(user).not.toBeUndefined();
    });
    it('find fail', async () => {
      const user = await service.findOne({ username: 'javascrip' });
      expect(user).toBeUndefined();
    });
    it('find test inject', async () => {
      const user = await service.findOne({
        username: "javascrip'or 1=1 or real_name ='1",
      });
      expect(user).toBeUndefined();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TestModController } from './test-mod.controller';
import { TestModService } from './test-mod.service';

describe('TestModController', () => {
  let controller: TestModController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestModController],
      providers: [TestModService],
    }).compile();

    controller = module.get<TestModController>(TestModController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

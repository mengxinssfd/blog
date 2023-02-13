import { Test, TestingModule } from '@nestjs/testing';
import { TestModService } from './test-mod.service';

describe('TestModService', () => {
  let service: TestModService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestModService],
    }).compile();

    service = module.get<TestModService>(TestModService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

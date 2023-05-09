import { Test, TestingModule } from '@nestjs/testing';
import { Ip2RegionService } from '@/modules/ip2region/ip2region.service';

describe('Ip2RegionService', () => {
  let service: Ip2RegionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Ip2RegionService],
    }).compile();

    service = module.get<Ip2RegionService>(Ip2RegionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('search', () => {
    expect(service.search('207.148.91.1')).toEqual({
      city: '东京',
      country: '日本',
      isp: '',
      province: '东京都',
    });
    expect(service.search('45.250.239.1')).toEqual({
      city: '',
      country: '柬埔寨',
      isp: 'Telecom-Cambodia',
      province: '',
    });
    expect(service.search('120.24.78.68')).toEqual({
      city: '深圳市',
      country: '中国',
      isp: '阿里云',
      province: '广东省',
    });
    expect(service.search('223.104.66.84')).toEqual({
      city: '东莞市',
      country: '中国',
      isp: '移动',
      province: '广东省',
    });
  });
  it('searchRaw', () => {
    expect(service.searchRaw('223.104.66.84')).toEqual({
      city: '东莞市',
      country: '中国',
      isp: '移动',
      province: '广东省',
      id: 2261,
      region: '',
    });
    expect(service.searchRaw('223.104.66.84', false)).toEqual({
      city: 2261,
      region: '中国|0|广东省|东莞市|移动',
    });
    expect(service.searchRaw('45.250.239.1', false)).toEqual({
      city: 9,
      region: '柬埔寨|0|0|0|Telecom-Cambodia',
    });
  });
});

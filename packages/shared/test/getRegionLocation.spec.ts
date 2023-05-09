import { getRegionLocation } from '../src';

describe('getRegionLocation', function () {
  it('--', () => {
    expect(getRegionLocation(null)).toBe('--');
    expect(getRegionLocation('')).toBe('--');
    expect(getRegionLocation('0|0|0|内网IP|内网IP')).toBe('--');
  });
  it('province', () => {
    expect(getRegionLocation('中国|0|上海|上海市|联通')).toBe('上海');
    expect(getRegionLocation('中国|0|上海|0|联通')).toBe('上海');
  });
  it('city', () => {
    expect(getRegionLocation('日本|0|0|东京|0')).toBe('东京');
    expect(getRegionLocation('日本|0|0|xx|0')).toBe('xx');
  });
  it('province city', () => {
    expect(getRegionLocation('中国|0|广东省|广州市|移动')).toBe('广东-广州');
    expect(getRegionLocation('中国|0|辽宁省|大连市|联通')).toBe('辽宁-大连');
    expect(getRegionLocation('日本|0|东京都|东京|0')).toBe('东京都-东京');
  });
  it('country', () => {
    expect(getRegionLocation('柬埔寨|0|0|0|Telecom-Cambodia')).toBe('柬埔寨');
    expect(getRegionLocation('日本|0|0|0|0')).toBe('日本');
  });
});

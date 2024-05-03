import { CreateProjectDto } from './create-project.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PROJECT_STATUS } from '@blog/entities';

describe('CreateProjectDto', function () {
  const dto = new CreateProjectDto();

  const date = new Date(2023, 0, 1);
  dto.cover = 'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/1683786635532.webp';
  dto.link = 'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com';
  dto.name = 'test';
  dto.status = PROJECT_STATUS.Completed;
  dto.startTime = date.toString() as any;

  const ins = plainToInstance(CreateProjectDto, dto);
  test('base', async () => {
    const errors = await validate(ins);
    expect(errors).toEqual([]);
  });
  test('startTime', () => {
    expect(typeof ins.startTime).toBe('object');
    expect(Object.prototype.toString.call(ins.startTime)).toBe('[object Date]');
    expect(ins.startTime).toEqual(date);
  });
  test('endTime', () => {
    expect(ins.endTime).toBe(undefined);

    dto.endTime = date.toString() as any;
    const ins2 = plainToInstance(CreateProjectDto, dto);
    expect(typeof ins2.endTime).toBe('object');
    expect(ins2.endTime).toEqual(date);

    dto.endTime = '' as any;
    const ins3 = plainToInstance(CreateProjectDto, dto);
    expect(typeof ins3.endTime).toBe('object');
    expect(ins3.endTime).toBe(null);

    dto.endTime = null as any;
    expect(plainToInstance(CreateProjectDto, dto).endTime).toBe(null);
  });
});

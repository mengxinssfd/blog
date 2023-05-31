import { CreateSaysDto } from './create-says.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateSaysDto', () => {
  it('should validate correctly', async () => {
    const dto = new CreateSaysDto();
    dto.visible = '11' as any;
    const date = new Date(2020, 1, 1);
    dto.expires = date.toISOString() as any;

    (dto as any).test = 1;

    const ins = plainToInstance(CreateSaysDto, dto, {
      enableImplicitConversion: true,
    });
    const errors = await validate(ins, { whitelist: true });
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '说说内容不能为空',
          isString: '内容必须是字符串',
        },
        property: 'content',
        target: {
          expires: date,
          status: 11,
        },
        value: undefined,
      },
      {
        children: [],
        constraints: {
          isEnum: '状态必须是0,1,2其中之一',
        },
        property: 'status',
        target: {
          expires: date,
          status: 11,
        },
        value: 11,
      },
    ]);

    expect(ins.expires).not.toBeNull();
    const expires = ins.expires!;
    expect([expires.getFullYear(), expires.getMonth(), expires.getDate()]).toEqual([2020, 1, 1]);
  });
});

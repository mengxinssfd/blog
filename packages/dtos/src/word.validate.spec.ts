import { WordValidate } from './word.validate';
import { Validate, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class Test {
  @Validate(WordValidate)
  word!: string;
}

describe('wordValidate', function () {
  it('test', () => {
    const ins = plainToInstance(Test, { word: '他妈' });
    expect(validateSync(ins, { whitelist: true })).toEqual([
      {
        children: [],
        constraints: {
          wordValidate: 'word(他妈)包含禁用词!请修改后再提交',
        },
        property: 'word',
        target: {
          word: '他妈',
        },
        value: '他妈',
      },
    ]);
    const ins2 = plainToInstance(Test, { word: 'caonima' });
    expect(validateSync(ins2, { whitelist: true })).toEqual([
      {
        children: [],
        constraints: {
          wordValidate: 'word(caonima)包含禁用词!请修改后再提交',
        },
        property: 'word',
        target: {
          word: 'caonima',
        },
        value: 'caonima',
      },
    ]);
  });
});

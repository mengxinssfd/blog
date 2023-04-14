import { WordValidate } from './word.validate';
import { Validate, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { keywords } from './keywords.json';
import Mint from 'mint-filter';

const mint = new Mint(keywords);
class Test {
  @Validate(WordValidate)
  word!: string;
}

describe('wordValidate', function () {
  function validate(word: string) {
    return validateSync(plainToInstance(Test, { word }), { whitelist: true });
  }
  it('error', () => {
    expect(validate('他妈')).toEqual([
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
    expect(validate('caonima')).toEqual([
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
  it('pass', () => {
    expect(validate('你好啊')).toEqual([]);
    expect(mint.verify('你好啊')).toBe(true);
    expect(mint.filter('tourist')).toEqual({ text: 'to***st', words: ['ur', 'ri'] });
  });
});

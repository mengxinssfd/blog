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
          wordValidate: 'word包含敏感词(["他妈"])!请修改后再提交',
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
          wordValidate: 'word包含敏感词(["cao"])!请修改后再提交',
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
    expect(mint.filter('tourist')).toEqual({ text: 'tourist', words: [] });
    expect(mint.filter('tour ist')).toEqual({ text: 'tour ist', words: [] });
    expect(
      mint.filter(
        'https://s.cn.bing.net/th?id=OHR.SouthPadre_ZH-CN8788572569_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp',
      ),
    ).toEqual({
      text: 'https://s.cn.bing.net/th?id=OHR.SouthPadre_ZH-CN8788572569_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp',
      words: [],
    });
  });
});

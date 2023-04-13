import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import Mint from 'mint-filter';
import * as Fs from 'fs';
import * as Path from 'path';

let mint: Mint;

@ValidatorConstraint({ name: 'wordValidate', async: false })
export class WordValidate implements ValidatorConstraintInterface {
  validate(value = '' /* args: ValidationArguments */): boolean {
    if (!mint) {
      const keywords = Fs.readFileSync(Path.resolve(__dirname, 'keywords')).toString().split('\n');
      mint = new Mint(keywords);
    }
    return mint.verify(value);
  }

  defaultMessage(args: ValidationArguments) {
    // console.log('1', args);
    // here you can provide default error message if validation failed
    return `${args.property}($value)包含禁用词!请修改后再提交`;
  }
}

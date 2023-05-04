import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import Mint from 'mint-filter';
import { keywords } from './keywords.json';

const mint = new Mint(keywords);

@ValidatorConstraint({ name: 'wordValidate', async: false })
export class WordValidate implements ValidatorConstraintInterface {
  validate(value = '' /* args: ValidationArguments */): boolean {
    return mint.verify(value);
  }

  defaultMessage(args: ValidationArguments) {
    // console.log('1', args);
    // here you can provide default error message if validation failed
    return `${args.property}包含敏感词(${JSON.stringify(
      mint.filter(args.value).words,
    )})!请修改后再提交`;
  }
}

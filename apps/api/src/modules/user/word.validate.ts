import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as TextCensor from 'text-censor';

@ValidatorConstraint({ name: 'wordValidate', async: false })
export class WordValidate implements ValidatorConstraintInterface {
  validate(value: string /* args: ValidationArguments */) {
    let filtered = '';
    TextCensor.filter(value, (_err: null, censored: string) => {
      filtered = censored;
    });
    return value === filtered; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // console.log('1', args);
    // here you can provide default error message if validation failed
    return `${args.property}($value)包含禁用词!请修改后再提交`;
  }
}

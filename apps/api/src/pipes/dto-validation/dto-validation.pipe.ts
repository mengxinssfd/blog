import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Logger } from '@/utils/log4js';

@Injectable()
export class DtoValidationPipe implements PipeTransform {
  constructor(private readonly metaTypes: any[] = []) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.metaTypes.includes(metatype)) {
      // 如果没有传入验证规则，则不验证，直接返回数据
      return value;
    }
    // console.log('\n-------------DtoValidationPipe transform start-------------\n');
    // 不要打印不需要验证的数据
    // console.log('DtoValidationPipe bind types', this.metaTypes);
    // console.log('DtoValidationPipe value:', value, 'metatype:', metatype);
    // 将对象转换为 Class 来验证
    const object = plainToInstance(metatype, value, {
      // 为true的话dto的属性必须加@Expose装饰器,没有加的都会被清理掉
      excludeExtraneousValues: true,
    });
    // console.log('DtoValidationPipe object:', object);
    // console.log('\n-------------DtoValidationPipe transform end-------------\n');
    const errors = (await validate(object)) as [ValidationError];
    if (errors.length > 0) {
      // 只需要取第一个错误信息并返回即可
      const [{ constraints }] = errors;
      const msg = (constraints && Object.values(constraints)[0]) || '';
      Logger.error(`Validation failed: ${msg}`);
      throw new BadRequestException(`Validation failed: ${msg}`);
    }
    return object;
  }
  // private static isCommonType(metatype: any) {
  //   const types = [String, Boolean, Number, Array, Object];
  //   return types.includes(metatype);
  // }
}

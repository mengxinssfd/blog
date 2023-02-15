import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Logger } from '@/utils/log4js';

@Injectable()
export class DtoValidationPipe implements PipeTransform {
  constructor(private readonly metaTypes: any[] = []) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log('DtoValidationPipe value:', value, 'metatype:', metatype);
    if (!metatype || !this.metaTypes.includes(metatype)) {
      // 如果没有传入验证规则，则不验证，直接返回数据
      return value;
    }
    // 将对象转换为 Class 来验证
    const object = plainToInstance(metatype, value, {
      // 为true的话dto的属性必须加@Expose装饰器,没有加的都会被清理掉
      excludeExtraneousValues: true,
    });
    console.log('DtoValidationPipe object:', object);
    const errors = await validate(object);
    if (errors.length > 0) {
      const msg = Object.values(errors[0]!.constraints as any)[0]; // 只需要取第一个错误信息并返回即可
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

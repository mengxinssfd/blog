export class BaseDto<T> {
  constructor(options?: Partial<T>) {
    Object.assign(this, options);
  }
}

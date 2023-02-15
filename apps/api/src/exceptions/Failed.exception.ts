import { HttpException } from '@nestjs/common';

export default class FailedException extends HttpException {
  constructor(response: string) {
    super(response, 0);
  }
}

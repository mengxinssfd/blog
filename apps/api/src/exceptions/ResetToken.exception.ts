import { HttpException } from '@nestjs/common';
import { UserEntity } from '@blog/entities';

export default class ResetTokenException extends HttpException {
  constructor(private data: { token: string; user?: UserEntity }) {
    super('success', 207);
  }

  override getResponse(): string | object {
    return this.data;
  }
}

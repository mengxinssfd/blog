import type { UserEntity } from '@blog/entities';
import type { Request as Req } from '@nestjs/common';

export type RequestWithUser = typeof Req & { user: UserEntity };

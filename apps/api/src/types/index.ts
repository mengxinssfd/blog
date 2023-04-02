import type { UserEntity } from '@blog/entities';
import type { Request } from '@nestjs/common';

export type RequestWithUser = Request & { user: UserEntity };

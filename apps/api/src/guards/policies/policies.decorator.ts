import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '@/guards/policies/casl-ability.factory';

/**
 * 函数式写法
 */
export type PolicyHandlerCallback = (ability: AppAbility) => boolean | void;

/**
 * 类写法
 */
export interface IPolicyHandler {
  handle: PolicyHandlerCallback;
}

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

/**
 * key
 */
export const CHECK_POLICIES_KEY = 'check_policies';

/**
 * PoliciesGuard配套装饰器
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

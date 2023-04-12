import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '@blog/permission-rules';
import { ForbiddenError } from '@casl/ability';

/**
 * 函数式写法
 */
export type PolicyHandlerCallback = (ability: AppAbility) => boolean;

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
export const CHECK_POLICIES_KEY = Symbol('check policies');

/**
 * PoliciesGuard配套装饰器
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

export type PolicyThrowHandlerCallback = (error: ForbiddenError<AppAbility>) => void;

/**
 * PoliciesGuard配套装饰器
 * ---
 * 可以使用 throwUnlessCan，抛出 rule 的 reason
 */
export const CheckPoliciesError = (...handlers: PolicyThrowHandlerCallback[]) => {
  function handlerWrapper(handler: PolicyThrowHandlerCallback) {
    return (ability: AppAbility) => handler(ForbiddenError.from(ability));
  }
  return SetMetadata(CHECK_POLICIES_KEY, handlers.map(handlerWrapper));
};

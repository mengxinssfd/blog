import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';
import { Reflector } from '@nestjs/core';

/**
 * 类写法
 */
interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

/**
 * 函数式写法
 */
type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

/**
 * key
 */
const CHECK_POLICIES_KEY = 'check_policies';

/**
 * PoliciesGuard配套装饰器
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector, private caslAbilityFactory: CaslAbilityFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    const { user } = context.switchToHttp().getRequest();
    console.log('uuuuuuuuuu', user);

    const ability = this.caslAbilityFactory.createForUser(user);
    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}

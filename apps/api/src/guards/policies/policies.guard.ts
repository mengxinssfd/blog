import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY, PolicyHandler, PolicyHandlerCallback } from './policies.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector, private caslAbilityFactory: CaslAbilityFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    const { user } = context.switchToHttp().getRequest();

    const ability = this.caslAbilityFactory.createForUser(user);
    const valid = policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));

    if (!valid) throw new ForbiddenException('无权操作');
    return true;
  }

  private execPolicyHandler(
    handler: PolicyHandler,
    ability: AppAbility,
  ): ReturnType<PolicyHandlerCallback> {
    if (typeof handler === 'function') {
      return handler(ability) ?? true;
    }
    return handler.handle(ability) ?? true;
  }
}

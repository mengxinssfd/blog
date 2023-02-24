import { Injectable } from '@nestjs/common';
import { CaslAbilityFactory as SuperCaslAbilityFactory } from '@blog/permission-rules';

@Injectable()
export class CaslAbilityFactory extends SuperCaslAbilityFactory {}

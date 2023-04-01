import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Configuration } from './config/configuration';
import type { Path } from '@nestjs/config';
import { PathValue } from '@nestjs/config/dist/types';

// import { EnvironmentVariables } from './env/env.variables';
// type EnvConfig = EnvironmentVariables & Configuration;

@Injectable()
export class AppConfigService<T extends Configuration = Configuration> extends ConfigService<T> {
  val<P extends Path<T>, R = PathValue<T, P>>(property: P, defaultValue?: R): R {
    return super.get(property as any, defaultValue) as any;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './config/configuration';

// import { EnvironmentVariables } from './env/env.variables';
// type EnvConfig = EnvironmentVariables & Configuration;

@Injectable()
export class AppConfigService<T extends Configuration = Configuration> extends ConfigService<T> {
  val<K extends keyof T>(property: K, defaultValue?: T[K]): T[K] {
    return super.get(property as any, defaultValue) as any;
  }
}

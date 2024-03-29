import { InferSubjects } from '@casl/ability';
import { BlogBaseEntity } from '@blog/entities/base.entity';
import { RuleCreator } from './types';

export function bootstrap<T extends typeof BlogBaseEntity>(
  entities: T[],
  ruleCreators: RuleCreator[],
) {
  type Subjects = InferSubjects<T, true> | 'all';
  const subjects: Subjects = '' as any;

  const classMap = entities.reduce((prev, cur) => {
    prev[cur['modelName']] = cur;
    return prev;
  }, {} as Record<string, T>);

  return {
    subjects,
    classMap,
    ruleRegister: ((user, builder) => {
      ruleCreators.forEach((c) => c(user, builder));
    }) as RuleCreator,
  };
}

import { getMilliseconds } from '@tool-pack/basic';
import { Get } from '../request';
import type { SentenceEntity } from '@blog/entities';

export function getRandomSentence() {
  return Get<SentenceEntity>(
    '/api/sentence/random',
    {},
    { cache: { timeout: getMilliseconds({ hours: 0.5 }) } },
  );
}

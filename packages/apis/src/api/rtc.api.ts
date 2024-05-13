import { methodsWithUrl } from '../request';
import type { CreateRtcDto } from '@blog/dtos';

const urlPrefix = '/api/rtc/';
const [Get, Post] = methodsWithUrl(['get', 'post'] as const, urlPrefix);

export function setRTCOffer(data: CreateRtcDto) {
  return Post('offer', data);
}
export async function getRTCOffer(token: string): Promise<ReturnType<typeof parseRTCData>> {
  const { data } = await Get<string>('offer/' + token);
  return parseRTCData(data);
}
export function setRTCAnswer(data: CreateRtcDto) {
  return Post('answer', data);
}
export async function getRTCAnswer(token: string): Promise<ReturnType<typeof parseRTCData>> {
  const { data } = await Get<string>('answer/' + token);
  return parseRTCData(data);
}

function parseRTCData(data: string): null | Pick<CreateRtcDto, 'candidates' | 'description'> {
  try {
    const ps = JSON.parse(data) as Pick<CreateRtcDto, 'candidates' | 'description'>;
    if (!ps.candidates || !ps.description) return null;
    return ps;
  } catch {
    return null;
  }
}

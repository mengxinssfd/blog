import * as Path from 'path';
import Fs from 'fs';
import childProcess from 'child_process';
import type { ChangeLog } from '~/types';

const res = childProcess.execSync('git log', { encoding: 'utf8' });
const split = res.split(/commit .+\n/);
split.splice(0, 1);

const parseChain: ((v: string, item: ChangeLog) => boolean)[] = [
  // Author
  (v) => /^Author: /.test(v), // Merge 也会在第一行
  // date
  (v, item) => {
    item.date = v.replace(/^Date:\s{3}/, '');
    return true;
  },
  // title | type ｜ scope
  (v, item) => {
    v = v.trim();
    if (/^(chore|test|docs|Revert)/.test(v)) return false;

    const sIndex = v.indexOf(':');
    // title
    if (sIndex === -1) {
      item.title = v;
      return true;
    }
    item.title = v.slice(sIndex + 1).trim();

    // type ｜ scope
    const m = /^(?<type>[a-z]+)(\((?<scope>[^)]+)\))?/.exec(v.slice(0, sIndex));
    if (!m) return true;
    if (m.groups) {
      if (m.groups.scope) {
        item.scope = m.groups.scope;
      }
      if (m.groups.type) {
        item.type = m.groups.type;
      }
    }
    return true;
  },
  // desc
  (v, item) => {
    item.desc = v;
    return true;
  },
];
const result = split.reduce((res, s) => {
  if (!s || s === '\n') return res;
  const sentences = s.split('\n').filter(Boolean);
  const item: ChangeLog = { date: '', title: '', type: '' };
  const _parseChain = parseChain.slice();
  while (sentences.length) {
    let sentence = sentences.shift()!;
    if (sentence === '    ') {
      sentence = sentences.map((s) => s.trim()).join('\n');
      sentences.length = 0;
    }
    try {
      if (!_parseChain.shift()!(sentence, item)) return res;
    } catch (e) {
      console.log(s);
    }
  }
  res.push(item);
  return res;
}, [] as ChangeLog[]);

console.log(`总共有 ${result.length} 条更新记录`);

const to = Path.resolve(__dirname, '../public/changelog.json');
Fs.writeFileSync(to, JSON.stringify(result));

import { AppRedisService } from '@/modules/redis/redis.service';
import { Injectable } from '@nestjs/common';
import * as FS from 'fs';
import * as Path from 'path';
import { randomItem } from '@tool-pack/basic';
import { SentenceEntity } from '@blog/entities';

@Injectable()
export class SentenceService {
  constructor(private readonly redisService: AppRedisService) {}
  findRandomOne() {
    return this.redisService.getRandomSentence(() => randomItem(this.getAllSentences()));
  }

  getAllSentences(): SentenceEntity[] {
    // 数据来源于 https://github.com/caoxingyu/chinese-gushiwen/blob/master/sentence/sentence1-10000.json
    // 由于 webpack 打包的关系，__dirname实际是 dist 目录
    const path = Path.resolve(__dirname, 'assets/sentences/sentences.json');
    const content = FS.readFileSync(path, 'utf8');
    return JSON.parse(content);
  }
}

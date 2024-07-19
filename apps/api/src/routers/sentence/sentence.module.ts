import { Module } from '@nestjs/common';
import { SentenceService } from './sentence.service';
import { SentenceController } from './sentence.controller';

@Module({
  controllers: [SentenceController],
  providers: [SentenceService],
})
export class SentenceModule {}

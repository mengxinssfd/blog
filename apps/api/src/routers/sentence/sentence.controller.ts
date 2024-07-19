import { Controller, Get } from '@nestjs/common';
import { SentenceService } from './sentence.service';

@Controller('sentence')
export class SentenceController {
  constructor(private readonly sentenceService: SentenceService) {}

  @Get('random')
  findRandomOne() {
    return this.sentenceService.findRandomOne();
  }
}

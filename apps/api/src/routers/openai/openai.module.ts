import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService],
})
export class OpenaiModule {}

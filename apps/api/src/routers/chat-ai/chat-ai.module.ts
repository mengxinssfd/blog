import { Module } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatAiController } from './chat-ai.controller';

@Module({
  controllers: [ChatAiController],
  providers: [ChatAiService],
})
export class ChatAiModule {}

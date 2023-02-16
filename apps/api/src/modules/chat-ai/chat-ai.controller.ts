import { Controller, Post, Body } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { CreateChatAiDto } from './dto/create-chat-ai.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('chat-ai')
@Controller('chat-ai')
export class ChatAiController {
  constructor(private readonly chatAiService: ChatAiService) {}

  @Post()
  chat(@Body() createChatAiDto: CreateChatAiDto) {
    return this.chatAiService.chatStart(createChatAiDto);
  }
}

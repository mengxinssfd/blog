import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { CreateOpenaiChatDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly chatAiService: OpenaiService) {}

  @ApiBearerAuth()
  @JwtAuth()
  @Post('/chat')
  chat(@Body() createChatAiDto: CreateOpenaiChatDto) {
    return this.chatAiService.chatStart(createChatAiDto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Post('/img')
  img(@Body() createChatAiDto: CreateOpenaiChatDto) {
    return this.chatAiService.imgStart(createChatAiDto);
  }
}

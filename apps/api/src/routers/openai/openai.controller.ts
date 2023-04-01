import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { CreateOpenaiChatDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly chatAiService: OpenaiService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/chat')
  chat(@Body() createChatAiDto: CreateOpenaiChatDto) {
    return this.chatAiService.chatStart(createChatAiDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/img')
  img(@Body() createChatAiDto: CreateOpenaiChatDto) {
    return this.chatAiService.imgStart(createChatAiDto);
  }
}

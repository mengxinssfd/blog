import { Injectable } from '@nestjs/common';
import { CreateChatAiDto } from './dto/create-chat-ai.dto';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class ChatAiService {
  private openai!: OpenAIApi;
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env['OPENAI_API_KEY'] as string,
    });
    this.openai = new OpenAIApi(configuration);
  }
  async chatStart(createChatAiDto: CreateChatAiDto) {
    // https://platform.openai.com/examples
    // 面试配置
    const res = await this.openai.createCompletion({
      prompt: createChatAiDto.text,
      model: 'text-davinci-003',
      temperature: 0.5,
      max_tokens: 1024 * 3,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    console.log('openai response:', res);
    return res.data.choices.reduce((prev, cur) => prev + cur.text, '');
  }
}

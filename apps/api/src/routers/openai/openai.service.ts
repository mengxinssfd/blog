import { Injectable } from '@nestjs/common';
import { CreateOpenaiChatDto } from '@blog/dtos';
import { Configuration, OpenAIApi } from 'openai';
import { AppConfigService } from '@/app.config.service';

@Injectable()
export class OpenaiService {
  private openai!: OpenAIApi;
  constructor(private readonly configService: AppConfigService) {
    const apiKey = this.configService.val('openai.apiKey');
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }
  async chatStart(createChatAiDto: CreateOpenaiChatDto) {
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
    console.log('openai response:', res.data);
    return res.data.choices.reduce((prev, cur) => prev + cur.text, '');
  }
  async imgStart(createChatAiDto: CreateOpenaiChatDto) {
    // https://platform.openai.com/docs/guides/images/usage
    const response = await this.openai.createImage({
      prompt: createChatAiDto.text,
      n: 1,
      size: '1024x1024',
    });

    return response.data.data[0]?.url;
  }
}

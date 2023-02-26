import { Controller, Get } from '@nestjs/common';
import { DailyImgService } from './daily-img.service';

@Controller('daily-img')
export class DailyImgController {
  constructor(private readonly dailyImgService: DailyImgService) {}

  @Get('')
  findOne() {
    return this.dailyImgService.findOne();
  }
}

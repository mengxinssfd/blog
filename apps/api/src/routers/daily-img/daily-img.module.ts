import { Module } from '@nestjs/common';
import { DailyImgService } from './daily-img.service';
import { DailyImgController } from './daily-img.controller';

@Module({
  controllers: [DailyImgController],
  providers: [DailyImgService],
})
export class DailyImgModule {}

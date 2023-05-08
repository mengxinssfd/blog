import { Module } from '@nestjs/common';
import { DailyImgService } from './daily-img.service';
import { DailyImgController } from './daily-img.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DailyImgController],
  providers: [DailyImgService],
})
export class DailyImgModule {}

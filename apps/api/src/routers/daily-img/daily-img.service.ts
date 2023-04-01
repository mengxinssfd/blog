import { Injectable } from '@nestjs/common';
import { httpsGet } from '@/utils/utils';

@Injectable()
export class DailyImgService {
  findOne() {
    return httpsGet('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7');
  }
}

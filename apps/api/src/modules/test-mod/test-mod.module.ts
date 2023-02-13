import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestModService } from './test-mod.service';
import { TestModController } from './test-mod.controller';
import { TestModEntity } from './entities/test-mod.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestModEntity])],
  controllers: [TestModController],
  providers: [TestModService],
})
export class TestModModule {}

import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@blog/entities';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagController],
  providers: [TagService, CaslAbilityFactory],
})
export class TagModule {}

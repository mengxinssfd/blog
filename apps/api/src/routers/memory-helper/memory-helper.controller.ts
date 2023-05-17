import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MemoryHelperService } from './memory-helper.service';
import { User } from '@/utils/decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateMemoryHelperDto, MemoryListDTO, UpdateMemoryHelperDto } from '@blog/dtos';
import { MemoryHelperEntity, UserEntity } from '@blog/entities';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { Action } from '@blog/permission-rules';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { JwtAuth } from '@/guards/auth/auth.decorator';

@Controller('memory-helper')
export class MemoryHelperController {
  constructor(
    private readonly memoryHelperService: MemoryHelperService,
    private readonly casl: CaslAbilityFactory,
  ) {}

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, MemoryHelperEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Post()
  async create(@Body() createMemoryHelperDto: CreateMemoryHelperDto, @User() user: UserEntity) {
    return this.memoryHelperService.create(createMemoryHelperDto, user.id);
  }

  @Get()
  findAll(@Query() params: MemoryListDTO, @User() user: UserEntity) {
    return this.memoryHelperService.findAll(params, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.memoryHelperService.findOne(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, MemoryHelperEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemoryHelperDto: UpdateMemoryHelperDto,
    @User() user: UserEntity,
  ) {
    await this._valid(id).unless(user).can(Action.Update);
    return this.memoryHelperService.update(+id, updateMemoryHelperDto);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, MemoryHelperEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
    await this._valid(id).unless(user).can(Action.Delete);
    await this.memoryHelperService.remove(+id);
  }

  private _valid(id: number) {
    return this.casl.find(() => this.memoryHelperService.findOneWithoutUser(id));
  }
}

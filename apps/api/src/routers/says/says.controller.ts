import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CreateSaysDto, UpdateSaysDto } from '@blog/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Device, ReqIp, User } from '@/utils/decorator';
import { SaysEntity, UserEntity } from '@blog/entities';
import { Action } from '@blog/permission-rules';
import { JwtAuth } from '@/guards/auth/auth.decorator';
import { CheckPolicies } from '@/guards/policies/policies.decorator';
import { PoliciesGuard } from '@/guards/policies/policies.guard';
import { Ip2RegionService } from '@/modules/ip2region/ip2region.service';
import { SaysService } from '@/routers/says/says.service';
import { PageDto } from '@blog/dtos/page.dto';

@ApiTags('says')
@Controller('says')
export class SaysController {
  constructor(
    private readonly ip2RegionService: Ip2RegionService,
    private readonly saysService: SaysService,
  ) {}

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Create, SaysEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Post()
  async create(
    @Body() dto: CreateSaysDto,
    @ReqIp() ip: string,
    @Device() device: { os: string; browser: string },
    @Headers('user-agent') ua: string,
  ) {
    const says = new SaysEntity({
      // content: dto.content,
      // status: dto.status || SaysEntity.STATUS.Public,
      // expires: dto.expires || null,
      ...dto,

      ip,
      ...device,
      ua: (ua || '').slice(0, 500), // ua可能伪造，导致长度特别长
      region: this.ip2RegionService.searchRawRegion(ip),
    });

    await this.saysService.create(says);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Delete, SaysEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.saysService.remove(id);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Update, SaysEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaysDto) {
    await this.saysService.update(id, dto);
  }

  @Get()
  findAll(@User() user: UserEntity) {
    return this.saysService.findAll(user);
  }

  @ApiBearerAuth()
  @JwtAuth()
  @CheckPolicies((ab) => ab.can(Action.Manage, SaysEntity.modelName))
  @UseGuards(PoliciesGuard)
  @Get('admin')
  findAllByAdmin(@Query() dto: PageDto) {
    return this.saysService.findAllByAdmin(dto);
  }
}

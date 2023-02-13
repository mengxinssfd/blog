import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestModService } from './test-mod.service';
import { CreateTestModDto } from './dto/create-test-mod.dto';
import { UpdateTestModDto } from './dto/update-test-mod.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('test-mod')
@Controller('test-mod')
export class TestModController {
  constructor(private readonly testModService: TestModService) {}

  @Post()
  create(@Body() createTestModDto: CreateTestModDto) {
    return this.testModService.create(createTestModDto);
  }

  @Get()
  findAll() {
    return this.testModService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testModService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestModDto: UpdateTestModDto) {
    return this.testModService.update(+id, updateTestModDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testModService.remove(+id);
  }
}

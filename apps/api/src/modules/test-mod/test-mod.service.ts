import { Injectable } from '@nestjs/common';
import { UpdateTestModDto } from './dto/update-test-mod.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestModEntity } from './entities/test-mod.entity';

@Injectable()
export class TestModService {
  constructor(
    @InjectRepository(TestModEntity)
    private readonly repository: Repository<TestModEntity>,
  ) {}
  create(data: UpdateTestModDto) {
    return this.repository.save(data);
  }

  findAll() {
    return TestModEntity.findAndCount();
  }

  findOne(id: number) {
    return TestModEntity.findOne({ where: { id } });
  }

  update(id: number, updateTestModDto: UpdateTestModDto) {
    const up = new TestModEntity();
    up.id = id;
    Object.assign(up, updateTestModDto);
    return up.save();
  }

  remove(id: number) {
    const rm = new TestModEntity();
    rm.id = id;
    return rm.remove({});
  }
}

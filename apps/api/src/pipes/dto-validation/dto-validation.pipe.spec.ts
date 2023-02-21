import { DtoValidationPipe } from './dto-validation.pipe';

describe('ValidationPipe', () => {
  it('should be defined', () => {
    expect(new DtoValidationPipe()).toBeDefined();
  });
});

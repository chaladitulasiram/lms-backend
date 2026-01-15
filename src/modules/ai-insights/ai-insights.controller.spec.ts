import { Test, TestingModule } from '@nestjs/testing';
import { AiInsightsController } from './ai-insights.controller';

describe('AiInsightsController', () => {
  let controller: AiInsightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiInsightsController],
    }).compile();

    controller = module.get<AiInsightsController>(AiInsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

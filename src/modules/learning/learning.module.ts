import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { SpacedRepetitionService } from './spaced-repetition.service';

@Module({
  controllers: [LearningController],
  providers: [LearningService, SpacedRepetitionService],
  exports: [LearningService, SpacedRepetitionService],
})
export class LearningModule {}

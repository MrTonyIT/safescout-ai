import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AiModule } from './modules/ai/ai.module';
import { LearningModule } from './modules/learning/learning.module';
import { ParentModule } from './modules/parent/parent.module';
import { APP_GUARD } from '@nestjs/core';
import { ReleaseGuard } from './common/guards/release.guard';
import { FamilyAccessGuard } from './common/guards/family-access.guard';
import { FamilyModule } from './modules/family/family.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  controllers:[HealthController],
  providers: [{ provide: APP_GUARD, useClass: ReleaseGuard }, {provide:APP_GUARD,useClass:FamilyAccessGuard}],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    FamilyModule,
    AiModule,
    LearningModule,
    ParentModule,
  ],
})
export class AppModule {}

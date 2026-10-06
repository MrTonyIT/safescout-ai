import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller('health')
export class HealthController {
  constructor(private readonly prisma:PrismaService){}
  @Get('live') live(){return {status:'up'};}
  @Get('ready') async ready(){
    try {await Promise.all([this.prisma.family.count(),this.prisma.contentApproval.count(),this.prisma.lessonReward.count(),this.prisma.familyFeedback.count(),this.prisma.testResult.findFirst({select:{contentVersion:true,contentSnapshot:true}})]);return {status:'ready'};}
    catch {throw new ServiceUnavailableException('Database or migrations not ready.');}
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { FamilyService } from '../../modules/family/family.service';
import { sessionCookie } from '../../modules/family/family.controller';
import { PrismaService } from '../../modules/prisma/prisma.service';
export const allowedOrigins = () => (process.env.WEB_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081').split(',').map(v => v.trim());
@Injectable()
export class FamilyAccessGuard implements CanActivate {
    constructor(private readonly families: FamilyService, private readonly prisma: PrismaService) { }
    async canActivate(context: ExecutionContext) {
        const controller = context.getClass().name;
        const handler = context.getHandler().name;
        if (!['LearningController', 'FamilyController'].includes(controller) || (controller === 'FamilyController' && handler === 'mode'))
            return true;
        const req = context.switchToHttp().getRequest();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            if (!allowedOrigins().includes(req.headers.origin))
                throw new ForbiddenException('Nguồn yêu cầu không được phép.');
        }
        await this.families.throttle('http:' + req.ip, 240, 60);
        if (controller === 'FamilyController' && ['register', 'login', 'recover'].includes(handler)) {
            await this.families.throttle('auth-ip:' + req.ip, 20, 900);
            return true;
        }
        if (controller === 'LearningController' && process.env.INTERNAL_LEARNING_PREVIEW === 'true') {
            const userId = req.method === 'GET' ? req.query.userId : req.body.userId;
            const demo = await this.prisma.user.findFirst({ where: { id: 'user_milo_explorer_01', familyId: null } });
            if (userId !== demo?.id)
                throw new ForbiddenException('Bản nội bộ chỉ dùng hồ sơ mẫu riêng.');
            return true;
        }
        req.familyId = await this.families.authenticate(sessionCookie(req));
        if (controller === 'LearningController') {
            const userId = req.method === 'GET' ? req.query.userId : req.body.userId;
            if (typeof userId !== 'string')
                throw new ForbiddenException('Cần chọn hồ sơ học.');
            await this.families.ownChild(req.familyId, userId);
        }
        return true;
    }
}

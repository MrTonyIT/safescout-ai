import { BadRequestException, ForbiddenException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
@Injectable()
export class FamilyService {
    constructor(private readonly prisma: PrismaService) { }
    async throttle(key: string, limit = 8, seconds = 900) {
        const hashed = tokenHash(key);
        await this.prisma.authThrottle.deleteMany({ where: { expiresAt: { lte: new Date() } } });
        const counter = await this.prisma.authThrottle.upsert({
            where: { key: hashed }, create: { key: hashed, count: 1, expiresAt: new Date(Date.now() + seconds * 1000) },
            update: { count: { increment: 1 } },
        });
        if (counter.count > limit)
            throw new HttpException('Đã thử nhiều lần. Vui lòng đợi rồi thử lại.', 429);
    }
    private normalize(login: string) { return login.trim().toLowerCase(); }
    private checkPassword(password: string) {
        if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72)
            throw new BadRequestException('Mật khẩu cần ít nhất 12 ký tự và tối đa 72 byte.');
    }
    async register(login: string, password: string) {
        this.checkPassword(password);
        const recoveryCode = randomBytes(24).toString('hex');
        try {
            const family = await this.prisma.family.create({ data: { login: this.normalize(login),
                    passwordHash: await bcrypt.hash(password, 12), recoveryHash: tokenHash(recoveryCode) } });
            return { familyId: family.id, recoveryCode };
        }
        catch (e: any) {
            if (e.code === 'P2002')
                throw new BadRequestException('Không thể dùng tên đăng nhập này.');
            throw e;
        }
    }
    async login(login: string, password: string) {
        const normalized = this.normalize(login);
        await this.throttle('login:' + normalized);
        const family = await this.prisma.family.findUnique({ where: { login: normalized } });
        // Same expensive comparison for unknown accounts; never return password hashes.
        const hash = family?.passwordHash || '$2b$12$8wdRVP45ydVXHQIaQSGRxeKge.JYwHgSqMM/gMg7qHbsiGEyIeRnG';
        const valid = await bcrypt.compare(password, hash);
        if (!family || !valid)
            throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu chưa đúng.');
        return family.id;
    }
    async createSession(familyId: string) {
        const token = randomBytes(32).toString('hex');
        await this.prisma.familySession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
        await this.prisma.familySession.create({ data: { tokenHash: tokenHash(token), familyId, expiresAt: new Date(Date.now() + 8 * 3600000) } });
        return token;
    }
    async authenticate(token?: string) {
        if (!token || !/^[a-f0-9]{64}$/.test(token))
            throw new UnauthorizedException('Vui lòng đăng nhập lại.');
        const session = await this.prisma.familySession.findUnique({ where: { tokenHash: tokenHash(token) } });
        if (!session || session.expiresAt <= new Date())
            throw new UnauthorizedException('Phiên đăng nhập đã kết thúc.');
        return session.familyId;
    }
    async ownChild(familyId: string, childId: string) {
        const child = await this.prisma.user.findFirst({ where: { id: childId, familyId } });
        if (!child)
            throw new ForbiddenException('Không có quyền truy cập hồ sơ này.');
        return child;
    }
    async me(familyId: string) {
        return this.prisma.family.findUniqueOrThrow({ where: { id: familyId }, select: { id: true, login: true,
                children: { select: { id: true, nickname: true, age: true, totalSafetyScore: true, totalBadges: true } } } });
    }
    async verifyPassword(familyId: string, password: string) {
        await this.throttle('reauth:' + familyId);
        const family = await this.prisma.family.findUnique({ where: { id: familyId } });
        if (!family || !await bcrypt.compare(password, family.passwordHash))
            throw new UnauthorizedException('Mật khẩu chưa đúng.');
    }
    async addChild(familyId: string, nickname: string, age: number) {
        return this.prisma.$transaction(async (tx) => {
            if (await tx.user.count({ where: { familyId } }) >= 5)
                throw new BadRequestException('Mỗi gia đình tối đa 5 hồ sơ.');
            return tx.user.create({ data: { familyId, nickname: nickname.trim(), age }, select: { id: true, nickname: true, age: true } });
        });
    }
    async history(familyId: string, childId: string) {
        await this.ownChild(familyId, childId);
        return this.prisma.testResult.findMany({ where: { userId: childId }, orderBy: { createdAt: 'desc' }, take: 50,
            select: { id: true, score: true, isPassed: true, createdAt: true, contentVersion: true, contentSnapshot: true, responseJson: true } });
    }
    async exportData(familyId: string, password: string) {
        await this.verifyPassword(familyId, password);
        return this.prisma.family.findUniqueOrThrow({ where: { id: familyId }, select: { login: true, createdAt: true, feedback:true,
                children: { include: { lessonProgress: true, testResults: true, mistakeLogs: true, userBadges: true, lessonRewards: true } } } });
    }
    async feedback(familyId:string, data:{category:string;message:string;checkpointId?:string;contentVersion?:string}) {
        await this.throttle('feedback:'+familyId,10,86400);
        const record=await this.prisma.familyFeedback.create({data:{familyId,...data},select:{id:true,createdAt:true}});
        return record;
    }
    async removeChild(familyId: string, childId: string, password: string) {
        await this.verifyPassword(familyId, password);
        await this.ownChild(familyId, childId);
        await this.prisma.user.delete({ where: { id: childId } });
    }
    async removeFamily(familyId: string, password: string) {
        await this.verifyPassword(familyId, password);
        await this.prisma.family.delete({ where: { id: familyId } });
    }
    async logout(token: string) {
        await this.prisma.familySession.deleteMany({ where: { tokenHash: tokenHash(token) } });
    }
    async changePassword(familyId: string, password: string, next: string) {
        this.checkPassword(next);
        await this.verifyPassword(familyId, password);
        await this.prisma.$transaction([
            this.prisma.family.update({ where: { id: familyId }, data: { passwordHash: await bcrypt.hash(next, 12) } }),
            this.prisma.familySession.deleteMany({ where: { familyId } }),
        ]);
    }
    async recover(login: string, code: string, password: string) {
        this.checkPassword(password);
        const normalized = this.normalize(login);
        await this.throttle('recover:' + normalized);
        const family = await this.prisma.family.findUnique({ where: { login: normalized } });
        const candidate = tokenHash(code);
        if (!family || !timingSafeEqual(Buffer.from(candidate), Buffer.from(family.recoveryHash)))
            throw new UnauthorizedException('Thông tin khôi phục chưa đúng.');
        const recoveryCode = randomBytes(24).toString('hex');
        await this.prisma.$transaction(async (tx) => {
            const update = await tx.family.updateMany({ where: { id: family.id, recoveryHash: candidate },
                data: { passwordHash: await bcrypt.hash(password, 12), recoveryHash: tokenHash(recoveryCode) } });
            if (!update.count)
                throw new UnauthorizedException('Mã khôi phục đã được sử dụng.');
            await tx.familySession.deleteMany({ where: { familyId: family.id } });
        });
        return { recoveryCode };
    }
}

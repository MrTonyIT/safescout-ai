import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { IsInt, IsString, Length, Matches, Max, Min, IsIn, IsOptional } from 'class-validator';
import { Request, Response } from 'express';
import { FamilyService } from './family.service';
import { createSuccessResponse as ok } from '../../common/interfaces/api-response.interface';
class Credentials {
    @IsString()
    @Matches(/^[a-zA-Z0-9_.-]{4,40}$/)
    login: string;
    @IsString()
    @Length(12, 72)
    password: string;
}
class Password {
    @IsString()
    @Length(1, 72)
    password: string;
}
class Feedback extends Password {
    @IsIn(['CONTENT','TECHNICAL','USABILITY']) category:string;
    @IsString() @Length(5,1000) @Matches(/\S/) message:string;
    @IsOptional() @IsString() @Length(1,100) checkpointId?:string;
    @IsOptional() @Matches(/^[a-f0-9]{64}$/) contentVersion?:string;
}
class Child extends Password {
    @IsString()
    @Length(1, 40)
    @Matches(/\S/)
    nickname: string;
    @IsInt()
    @Min(7)
    @Max(10)
    age: number;
}
class ChildAction extends Password {
    @IsString()
    @Length(1, 100)
    childId: string;
}
class NewPassword extends Password {
    @IsString()
    @Length(12, 72)
    next: string;
}
class Recovery extends Credentials {
    @IsString()
    @Matches(/^[a-f0-9]{48}$/)
    code: string;
}
export const sessionCookie = (req: Request) => req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('milo_session='))?.slice(13) || '';
@Controller('family')
export class FamilyController {
    constructor(private readonly families: FamilyService) { }
    @Post('feedback') async feedback(@Req() req:any,@Body() body:Feedback){
        await this.families.verifyPassword(req.familyId,body.password);
        const {password,...data}=body;
        return ok(await this.families.feedback(req.familyId,data));
    }
    private cookie(res: Response, token: string) {
        res.cookie('milo_session', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 8 * 3600000 });
    }
    @Get('mode')
    mode() { return ok({ internal: process.env.INTERNAL_LEARNING_PREVIEW === 'true', families: process.env.FAMILY_LEARNING_ENABLED === 'true' }); }
    @Post('register')
    async register(
    @Body()
    body: Credentials, 
    @Res({ passthrough: true })
    res: Response) {
        const result = await this.families.register(body.login, body.password);
        this.cookie(res, await this.families.createSession(result.familyId));
        return ok({ recoveryCode: result.recoveryCode });
    }
    @Post('login')
    async login(
    @Body()
    body: Credentials, 
    @Res({ passthrough: true })
    res: Response) {
        this.cookie(res, await this.families.createSession(await this.families.login(body.login, body.password)));
        return ok({ signedIn: true });
    }
    @Post('recover')
    async recover(
    @Body()
    body: Recovery) { return ok(await this.families.recover(body.login, body.code, body.password)); }
    @Get('me')
    async me(
    @Req()
    req: any) { return ok(await this.families.me(req.familyId)); }
    @Post('children')
    async child(
    @Req()
    req: any, 
    @Body()
    body: Child) {
        await this.families.verifyPassword(req.familyId, body.password);
        return ok(await this.families.addChild(req.familyId, body.nickname, body.age));
    }
    @Post('history')
    async history(
    @Req()
    req: any, 
    @Body()
    body: ChildAction) {
        await this.families.verifyPassword(req.familyId, body.password);
        return ok(await this.families.history(req.familyId, body.childId));
    }
    @Post('export')
    async exportData(
    @Req()
    req: any, 
    @Body()
    body: Password) { return ok(await this.families.exportData(req.familyId, body.password)); }
    @Post('delete-child')
    async removeChild(
    @Req()
    req: any, 
    @Body()
    body: ChildAction) {
        await this.families.removeChild(req.familyId, body.childId, body.password);
        return ok({ deleted: true });
    }
    @Post('delete')
    async remove(
    @Req()
    req: any, 
    @Body()
    body: Password, 
    @Res({ passthrough: true })
    res: Response) {
        await this.families.removeFamily(req.familyId, body.password);
        res.clearCookie('milo_session', { path: '/' });
        return ok({ deleted: true });
    }
    @Post('password')
    async password(
    @Req()
    req: any, 
    @Body()
    body: NewPassword, 
    @Res({ passthrough: true })
    res: Response) {
        await this.families.changePassword(req.familyId, body.password, body.next);
        res.clearCookie('milo_session', { path: '/' });
        return ok({ changed: true });
    }
    @Post('logout')
    async logout(
    @Req()
    req: Request, 
    @Res({ passthrough: true })
    res: Response) {
        await this.families.logout(sessionCookie(req));
        res.clearCookie('milo_session', { path: '/' });
        return ok({ signedOut: true });
    }
}

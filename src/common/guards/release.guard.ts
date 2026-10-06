import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';

/** Defense in depth: hiding a screen does not disable its HTTP endpoints. */
@Injectable()
export class ReleaseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const controller = context.getClass().name;
    if (controller === 'AiController' && context.getHandler().name === 'getHealth') return true;
    if (controller === 'AiController' || controller === 'ParentController') {
      throw new ServiceUnavailableException('Tính năng đang đóng để hoàn thiện xác thực và kiểm định.');
    }
    if (controller === 'FamilyController' && context.getHandler().name !== 'mode' && process.env.FAMILY_LEARNING_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Tài khoản gia đình chưa mở trong môi trường này.');
    }
    if (controller === 'LearningController' && process.env.INTERNAL_LEARNING_PREVIEW !== 'true' && process.env.FAMILY_LEARNING_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Luồng học hiện chỉ dành cho môi trường thử nghiệm nội bộ.');
    }
    return true;
  }
}

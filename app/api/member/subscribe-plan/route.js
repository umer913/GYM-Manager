import handler from '../../../../backend/api/member/subscribe-plan';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

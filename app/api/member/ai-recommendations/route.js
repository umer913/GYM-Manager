import handler from '../../../../backend/api/member/ai-recommendations';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

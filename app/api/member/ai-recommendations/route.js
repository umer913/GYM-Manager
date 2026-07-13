import handler from '../../../../routes/api/member/ai-recommendations';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

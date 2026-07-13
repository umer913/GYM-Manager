import handler from '../../../../routes/api/member/dashboard';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

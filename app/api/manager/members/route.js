import handler from '../../../../routes/api/manager/members';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);
export const PUT = wrapHandler(handler);

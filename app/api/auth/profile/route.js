import handler from '../../../../backend/api/auth/profile';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);
export const PUT = wrapHandler(handler);

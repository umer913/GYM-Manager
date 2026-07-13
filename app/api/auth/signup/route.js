import handler from '../../../../backend/api/auth/signup';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

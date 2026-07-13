import handler from '../../../../backend/api/auth/verify-otp';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

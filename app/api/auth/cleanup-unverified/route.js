import handler from '../../../../routes/api/auth/cleanup-unverified';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

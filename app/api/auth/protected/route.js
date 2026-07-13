import handler from '../../../../routes/api/auth/protected';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

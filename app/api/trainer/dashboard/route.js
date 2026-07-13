import handler from '../../../../backend/api/trainer/dashboard';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

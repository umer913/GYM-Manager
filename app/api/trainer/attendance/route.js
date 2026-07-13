import handler from '../../../../routes/api/trainer/attendance';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

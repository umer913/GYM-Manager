import handler from '../../../../routes/api/trainer/member-attendance';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

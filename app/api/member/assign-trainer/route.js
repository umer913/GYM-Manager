import handler from '../../../../routes/api/member/assign-trainer';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

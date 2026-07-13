import handler from '../../../../routes/api/member/checkin';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

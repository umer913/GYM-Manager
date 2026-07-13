import handler from '../../../../routes/api/trainer/checkin';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

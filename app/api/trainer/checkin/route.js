import handler from '../../../../backend/api/trainer/checkin';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const POST = wrapHandler(handler);

import handler from '../../../../backend/api/manager/checkin';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);
export const POST = wrapHandler(handler);
export const DELETE = wrapHandler(handler);

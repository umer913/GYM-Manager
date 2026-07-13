import handler from '../../../../routes/api/manager/plans';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);
export const POST = wrapHandler(handler);
export const PUT = wrapHandler(handler);
export const DELETE = wrapHandler(handler);

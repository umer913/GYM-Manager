import handler from '../../../../routes/api/manager/qr-session';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);
export const POST = wrapHandler(handler);

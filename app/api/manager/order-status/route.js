import handler from '../../../../routes/api/manager/order-status';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const PUT = wrapHandler(handler);

import handler from '../../../routes/api/test-mongo';
import { wrapHandler } from '../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

import handler from '../../../../backend/api/member/my-workouts';
import { wrapHandler } from '../../../../backend/utils/app-router-adapter';

export const GET = wrapHandler(handler);

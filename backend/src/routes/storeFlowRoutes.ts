import { Router } from 'express';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';
import { StoreFlowController } from '../controllers/StoreFlowController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const controller = new StoreFlowController();

router.post('/', requirePermission(PERMISSIONS.STORE_FLOW_CREATE), asyncHandler(controller.saveToday.bind(controller)));

export default router;

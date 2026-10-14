import { Router } from 'express';
import { SalesIntentionModelosDealerController } from '../controllers/SalesIntentionModelosDealerController';
import { asyncHandler } from '../utils/asyncHandler';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';

const router = Router();
const controller = new SalesIntentionModelosDealerController();

router.get('/', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.list.bind(controller)));
router.get('/by-placa', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.findByPlaca.bind(controller)));

export default router;

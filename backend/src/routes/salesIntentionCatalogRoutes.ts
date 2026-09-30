import { Router } from 'express';
import { SalesIntentionCatalogController } from '../controllers/SalesIntentionCatalogController';
import { asyncHandler } from '../utils/asyncHandler';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';

const router = Router();
const controller = new SalesIntentionCatalogController();

router.get('/', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.list.bind(controller)));

export default router;

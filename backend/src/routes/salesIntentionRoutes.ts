import { Router } from 'express';
import { SalesIntentionController } from '../controllers/SalesIntentionController';
import { asyncHandler } from '../utils/asyncHandler';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';

const router = Router();
const controller = new SalesIntentionController();

router.get('/', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.list.bind(controller)));
router.get('/search', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.search.bind(controller)));
router.get('/:id', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.getById.bind(controller)));
router.post('/', requirePermission(PERMISSIONS.INTENTION_CREATE), asyncHandler(controller.create.bind(controller)));
router.put('/:id', requirePermission(PERMISSIONS.INTENTION_UPDATE), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', requirePermission(PERMISSIONS.INTENTION_DELETE), asyncHandler(controller.delete.bind(controller)));

export default router;

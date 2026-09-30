import { Router } from 'express';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';
import { UserController } from '../controllers/UserController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const controller = new UserController();

router.get('/', requirePermission(PERMISSIONS.USER_VIEW), asyncHandler(controller.list.bind(controller)));
router.patch('/:id/status', requirePermission(PERMISSIONS.USER_MANAGE), asyncHandler(controller.updateStatus.bind(controller)));
router.put('/:id/roles', requirePermission(PERMISSIONS.USER_MANAGE), asyncHandler(controller.updateRoles.bind(controller)));
router.put('/:id/regional', requirePermission(PERMISSIONS.USER_MANAGE), asyncHandler(controller.updateRegional.bind(controller)));

export default router;

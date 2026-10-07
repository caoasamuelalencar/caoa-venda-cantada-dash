import { Router } from 'express';
import { requireAdmin } from '../auth/backendAuthentication';
import { UserController } from '../controllers/UserController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const controller = new UserController();

router.get('/me/access', asyncHandler(controller.currentAccess.bind(controller)));
router.get('/me/screens', asyncHandler(controller.currentScreens.bind(controller)));
router.get('/access-management/context', requireAdmin, asyncHandler(controller.accessContext.bind(controller)));
router.get('/access-management', requireAdmin, asyncHandler(controller.list.bind(controller)));
router.get('/roles', requireAdmin, asyncHandler(controller.listRoles.bind(controller)));
router.get('/screens', requireAdmin, asyncHandler(controller.listScreens.bind(controller)));
router.get('/', requireAdmin, asyncHandler(controller.list.bind(controller)));
router.get('/:id/roles', requireAdmin, asyncHandler(controller.getRoles.bind(controller)));
router.patch('/:id/status', requireAdmin, asyncHandler(controller.updateStatus.bind(controller)));
router.delete('/:id', requireAdmin, asyncHandler(controller.remove.bind(controller)));
router.put('/:id/roles', requireAdmin, asyncHandler(controller.updateRoles.bind(controller)));
router.put('/:id/screens', requireAdmin, asyncHandler(controller.updateScreens.bind(controller)));

export default router;

import { Router } from 'express';
import { SalesIntentionClassificacaoVendaController } from '../controllers/SalesIntentionClassificacaoVendaController';
import { asyncHandler } from '../utils/asyncHandler';
import { requirePermission } from '../auth/backendAuthentication';
import { PERMISSIONS } from '../auth/authorization';

const router = Router();
const controller = new SalesIntentionClassificacaoVendaController();

router.get('/', requirePermission(PERMISSIONS.INTENTION_VIEW), asyncHandler(controller.list.bind(controller)));

export default router;

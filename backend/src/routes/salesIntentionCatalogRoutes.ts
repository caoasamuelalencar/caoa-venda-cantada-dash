import { Router } from 'express';
import { SalesIntentionCatalogController } from '../controllers/SalesIntentionCatalogController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const controller = new SalesIntentionCatalogController();

router.get('/', asyncHandler(controller.list.bind(controller)));

export default router;

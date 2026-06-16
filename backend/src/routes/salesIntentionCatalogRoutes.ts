import { Router } from 'express';
import { SalesIntentionCatalogController } from '../controllers/SalesIntentionCatalogController';

const router = Router();
const controller = new SalesIntentionCatalogController();

router.get('/', controller.list.bind(controller));

export default router;

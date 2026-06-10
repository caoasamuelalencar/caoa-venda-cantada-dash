import { Router } from 'express';
import { SalesIntentionController } from '../controllers/SalesIntentionController';

const router = Router();
const controller = new SalesIntentionController();

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;

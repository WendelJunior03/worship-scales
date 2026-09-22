import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { desinscreverController, getChavePublicaController, inscreverController } from '../controllers/pushController';

const router = Router();

router.get('/chave-publica', getChavePublicaController)
router.post('/inscricoes', authMiddleware, inscreverController)
router.delete('/inscricoes', authMiddleware, desinscreverController)

export default router;

import teacherRoutes from './teacher.routes';
import { Router } from 'express';

const router = Router();
router.use('/', teacherRoutes);

export default router;

import { Router, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { taskValidator, idParamValidator } from '../middleware/validators';

const router = Router();
const taskService = new TaskService();

// All routes require authentication
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskService.getAllTasks(req.userId!);
    
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', idParamValidator, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.userId!);
    
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', taskValidator, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const task = await taskService.createTask(req.userId!, title, description);
    
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', idParamValidator, taskValidator, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, completed } = req.body;
    const task = await taskService.updateTask(
      req.params.id,
      req.userId!,
      title,
      description,
      completed
    );
    
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', idParamValidator, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await taskService.deleteTask(req.params.id, req.userId!);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

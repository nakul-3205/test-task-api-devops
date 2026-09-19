import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerValidator, loginValidator } from '../middleware/validators';

const router = Router();
const authService = new AuthService();

router.post('/register', registerValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

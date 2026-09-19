import { Router } from 'express';
import prisma from '../db/prisma';
import { getRedisClient } from '../services/task.service';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/ready', async (_req, res) => {
  const checks: Record<string, boolean> = {};
  let allHealthy = true;

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    checks.database = false;
    allHealthy = false;
    console.error('Database health check failed:', error);
  }

  // Check Redis connection
  try {
    const redisClient = await getRedisClient();
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      checks.redis = true;
    } else {
      checks.redis = false;
      allHealthy = false;
    }
  } catch (error) {
    checks.redis = false;
    allHealthy = false;
    console.error('Redis health check failed:', error);
  }

  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;

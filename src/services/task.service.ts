import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (!redisClient) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await redisClient.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      return null;
    }
  }
  return redisClient;
};

export class TaskService {
  async getAllTasks(userId: string) {
    const cacheKey = `tasks:${userId}`;
    
    // Try to get from Redis cache
    const client = await getRedisClient();
    if (client) {
      try {
        const cached = await client.get(cacheKey);
        if (cached) {
          console.log('Cache hit for tasks');
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis cache read error:', error);
      }
    }

    // Get from database
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Cache the result
    if (client && tasks.length > 0) {
      try {
        await client.setEx(cacheKey, 60, JSON.stringify(tasks));
      } catch (error) {
        console.error('Redis cache write error:', error);
      }
    }

    return tasks;
  }

  async getTaskById(id: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return task;
  }

  async createTask(userId: string, title: string, description?: string) {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });

    // Invalidate cache
    await this.invalidateUserCache(userId);

    return task;
  }

  async updateTask(
    id: string,
    userId: string,
    title?: string,
    description?: string,
    completed?: boolean
  ) {
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    if (existingTask.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        completed,
      },
    });

    // Invalidate cache
    await this.invalidateUserCache(userId);

    return task;
  }

  async deleteTask(id: string, userId: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    if (existingTask.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.task.delete({ where: { id } });

    // Invalidate cache
    await this.invalidateUserCache(userId);
  }

  private async invalidateUserCache(userId: string) {
    const client = await getRedisClient();
    if (client) {
      try {
        await client.del(`tasks:${userId}`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }
  }
}

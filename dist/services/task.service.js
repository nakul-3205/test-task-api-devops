"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_2 = require("../db/prisma");
class TaskService {
    async getAllTasks(userId) {
        const cacheKey = `tasks:${userId}`;
        // Try to get from Redis cache
        const client = await (0, prisma_2.getRedisClient)();
        if (client) {
            try {
                const cached = await client.get(cacheKey);
                if (cached) {
                    console.log('Cache hit for tasks');
                    return JSON.parse(cached);
                }
            }
            catch (error) {
                console.error('Redis cache read error:', error);
            }
        }
        // Get from database
        const tasks = await prisma_1.default.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        // Cache the result
        if (client && tasks.length > 0) {
            try {
                await client.setEx(cacheKey, 60, JSON.stringify(tasks));
            }
            catch (error) {
                console.error('Redis cache write error:', error);
            }
        }
        return tasks;
    }
    async getTaskById(id, userId) {
        const task = await prisma_1.default.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        if (task.userId !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        return task;
    }
    async createTask(userId, title, description) {
        const task = await prisma_1.default.task.create({
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
    async updateTask(id, userId, title, description, completed) {
        const existingTask = await prisma_1.default.task.findUnique({ where: { id } });
        if (!existingTask) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        if (existingTask.userId !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        const task = await prisma_1.default.task.update({
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
    async deleteTask(id, userId) {
        const existingTask = await prisma_1.default.task.findUnique({ where: { id } });
        if (!existingTask) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        if (existingTask.userId !== userId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        await prisma_1.default.task.delete({ where: { id } });
        // Invalidate cache
        await this.invalidateUserCache(userId);
    }
    async invalidateUserCache(userId) {
        const client = await (0, prisma_2.getRedisClient)();
        if (client) {
            try {
                await client.del(`tasks:${userId}`);
            }
            catch (error) {
                console.error('Redis cache invalidation error:', error);
            }
        }
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map
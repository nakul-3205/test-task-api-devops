"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../db/prisma"));
const prisma_2 = require("../db/prisma");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
router.get('/ready', async (_req, res) => {
    const checks = {};
    let allHealthy = true;
    // Check database connection
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        checks.database = true;
    }
    catch (error) {
        checks.database = false;
        allHealthy = false;
        console.error('Database health check failed:', error);
    }
    // Check Redis connection
    try {
        const redisClient = await (0, prisma_2.getRedisClient)();
        if (redisClient && redisClient.isOpen) {
            await redisClient.ping();
            checks.redis = true;
        }
        else {
            checks.redis = false;
            allHealthy = false;
        }
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=health.routes.js.map
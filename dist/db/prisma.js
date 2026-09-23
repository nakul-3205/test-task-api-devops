"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisClient = exports.getRedisClient = void 0;
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
exports.default = prisma;
let redisClient = null;
const getRedisClient = async () => {
    if (!redisClient) {
        try {
            redisClient = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
            });
            redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
            });
            await redisClient.connect();
            console.log('Connected to Redis');
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            return null;
        }
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const closeRedisClient = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            redisClient = null;
            console.log('Redis connection closed');
        }
        catch (error) {
            console.error('Error closing Redis connection:', error);
        }
    }
};
exports.closeRedisClient = closeRedisClient;
//# sourceMappingURL=prisma.js.map
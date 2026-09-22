"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./db/prisma"));
const prisma_2 = require("./db/prisma");
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    try {
        // Close database connections
        await prisma_1.default.$disconnect();
        console.log('Database connections closed');
        // Close Redis connection
        await (0, prisma_2.closeRedisClient)();
        // Close server
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Forced shutdown due to timeout');
            process.exit(1);
        }, 10000);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = server;
//# sourceMappingURL=server.js.map
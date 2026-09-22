import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
declare const prisma: PrismaClient<{
    log: ("query" | "warn" | "error")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
export declare const getRedisClient: () => Promise<RedisClientType | null>;
export declare const closeRedisClient: () => Promise<void>;
//# sourceMappingURL=prisma.d.ts.map
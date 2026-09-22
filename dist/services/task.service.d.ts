export declare class TaskService {
    getAllTasks(userId: string): Promise<any>;
    getTaskById(id: string, userId: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        completed: boolean;
    }>;
    createTask(userId: string, title: string, description?: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        completed: boolean;
    }>;
    updateTask(id: string, userId: string, title?: string, description?: string, completed?: boolean): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        completed: boolean;
    }>;
    deleteTask(id: string, userId: string): Promise<void>;
    private invalidateUserCache;
}
//# sourceMappingURL=task.service.d.ts.map
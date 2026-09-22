"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_service_1 = require("../services/task.service");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
const taskService = new task_service_1.TaskService();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const tasks = await taskService.getAllTasks(req.userId);
        res.status(200).json({
            success: true,
            data: tasks,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', validators_1.idParamValidator, async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id, req.userId);
        res.status(200).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', validators_1.taskValidator, async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const task = await taskService.createTask(req.userId, title, description);
        res.status(201).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', validators_1.idParamValidator, validators_1.taskValidator, async (req, res, next) => {
    try {
        const { title, description, completed } = req.body;
        const task = await taskService.updateTask(req.params.id, req.userId, title, description, completed);
        res.status(200).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', validators_1.idParamValidator, async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id, req.userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=task.routes.js.map
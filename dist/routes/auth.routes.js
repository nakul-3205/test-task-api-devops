"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const validators_1 = require("../middleware/validators");
const router = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
router.post('/register', validators_1.registerValidator, async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const result = await authService.register(email, password, name);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', validators_1.loginValidator, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
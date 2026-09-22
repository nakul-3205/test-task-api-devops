"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamValidator = exports.taskValidator = exports.loginValidator = exports.registerValidator = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const validate = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorHandler_1.AppError(errors.array()?.[0]?.msg || 'Validation failed', 400));
    }
    next();
};
exports.validate = validate;
exports.registerValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').optional().trim(),
    exports.validate,
];
exports.loginValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.validate,
];
exports.taskValidator = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('completed').optional().isBoolean(),
    exports.validate,
];
exports.idParamValidator = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Invalid task ID'),
    exports.validate,
];
//# sourceMappingURL=validators.js.map
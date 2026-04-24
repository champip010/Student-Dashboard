"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
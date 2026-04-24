"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const client_1 = require("@prisma/client");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const student_routes_js_1 = __importDefault(require("./routes/student.routes.js"));
const class_routes_js_1 = __importDefault(require("./routes/class.routes.js"));
const assignment_routes_js_1 = __importDefault(require("./routes/assignment.routes.js"));
const test_routes_js_1 = __importDefault(require("./routes/test.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./routes/dashboard.routes.js"));
const analytics_routes_js_1 = __importDefault(require("./routes/analytics.routes.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student Management System API',
            version: '1.0.0',
            description: 'RESTful API for Student Management System',
        },
        servers: [
            { url: 'http://localhost:3001', description: 'Development server' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/users', user_routes_js_1.default);
app.use('/api/students', student_routes_js_1.default);
app.use('/api/classes', class_routes_js_1.default);
app.use('/api/assignments', assignment_routes_js_1.default);
app.use('/api/tests', test_routes_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
app.use('/api/analytics', analytics_routes_js_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(errorHandler_js_1.errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api/docs`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
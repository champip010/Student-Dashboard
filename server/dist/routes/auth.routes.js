"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../index.js");
const schemas_js_1 = require("../types/schemas.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = schemas_js_1.loginSchema.parse(req.body);
        const user = await index_js_1.prisma.user.findUnique({
            where: { email },
            include: {
                teacherProfile: true,
                studentProfile: true,
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
        const { password: _, ...userData } = user;
        return res.json({
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(400).json({ error: 'Invalid request' });
    }
});
router.get('/me', auth_js_1.authenticate, async (req, res) => {
    try {
        const user = await index_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                teacherProfile: true,
                studentProfile: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password: _, ...userData } = user;
        return res.json(userData);
    }
    catch (error) {
        console.error('Get me error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/logout', (req, res) => {
    return res.json({ message: 'Logged out successfully' });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
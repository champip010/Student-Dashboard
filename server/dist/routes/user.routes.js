"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        const { page = '1', limit = '10', role, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            index_js_1.prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    teacherProfile: { select: { firstName: true, lastName: true } },
                    studentProfile: { select: { firstName: true, lastName: true } },
                },
            }),
            index_js_1.prisma.user.count({ where }),
        ]);
        return res.json({
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/teachers', auth_js_1.authenticate, async (req, res) => {
    try {
        const teachers = await index_js_1.prisma.teacher.findMany({
            select: { id: true, firstName: true, lastName: true },
        });
        return res.json(teachers);
    }
    catch (error) {
        console.error('Get teachers error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map
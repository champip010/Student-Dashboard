"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const [totalStudents, activeClasses, pendingAssignments, upcomingTests, recentActivity,] = await Promise.all([
            index_js_1.prisma.student.count({ where: { status: 'ACTIVE' } }),
            index_js_1.prisma.class.count({ where: { status: 'ACTIVE' } }),
            index_js_1.prisma.assignment.count({
                where: {
                    dueDate: { gte: new Date() },
                },
            }),
            index_js_1.prisma.test.count({
                where: {
                    date: { gte: new Date() },
                },
            }),
            index_js_1.prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true } },
                    teacher: { select: { firstName: true, lastName: true } },
                    student: { select: { firstName: true, lastName: true } },
                },
            }),
        ]);
        return res.json({
            kpis: {
                totalStudents,
                activeClasses,
                pendingAssignments,
                upcomingTests,
            },
            recentActivity,
        });
    }
    catch (error) {
        console.error('Get dashboard error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/quick-actions', auth_js_1.authenticate, async (req, res) => {
    try {
        const teachers = await index_js_1.prisma.teacher.findMany({
            take: 5,
            select: { id: true, firstName: true, lastName: true },
        });
        const classes = await index_js_1.prisma.class.findMany({
            where: { status: 'ACTIVE' },
            take: 5,
            select: { id: true, name: true, code: true },
        });
        return res.json({
            teachers,
            classes,
        });
    }
    catch (error) {
        console.error('Get quick actions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map
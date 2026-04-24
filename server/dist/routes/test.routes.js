"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const { page = '1', limit = '10', search, classId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        if (classId) {
            where.classId = classId;
        }
        const [tests, total] = await Promise.all([
            index_js_1.prisma.test.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { date: 'desc' },
                include: {
                    class: true,
                    teacher: true,
                    _count: { select: { scores: true } },
                },
            }),
            index_js_1.prisma.test.count({ where }),
        ]);
        return res.json({
            tests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get tests error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const test = await index_js_1.prisma.test.findUnique({
            where: { id: req.params.id },
            include: {
                class: {
                    include: {
                        enrollments: {
                            include: { student: true },
                        },
                    },
                },
                teacher: true,
                scores: {
                    include: { student: true },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        return res.json(test);
    }
    catch (error) {
        console.error('Get test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const data = req.body;
        const test = await index_js_1.prisma.test.create({
            data: {
                title: data.title,
                date: new Date(data.date),
                duration: data.duration,
                totalMarks: data.totalMarks,
                syllabus: data.syllabus,
                classId: data.classId,
                teacherId: data.teacherId,
            },
            include: { class: true, teacher: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Test Scheduled',
                details: `${test.title} scheduled for ${test.class.name}`,
                userId: req.user.id,
                teacherId: data.teacherId,
            },
        });
        return res.status(201).json(test);
    }
    catch (error) {
        console.error('Create test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const test = await index_js_1.prisma.test.update({
            where: { id },
            data: {
                title: data.title,
                date: data.date ? new Date(data.date) : undefined,
                duration: data.duration,
                totalMarks: data.totalMarks,
                syllabus: data.syllabus,
            },
        });
        return res.json(test);
    }
    catch (error) {
        console.error('Update test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await index_js_1.prisma.test.delete({
            where: { id: req.params.id },
        });
        return res.json({ message: 'Test deleted successfully' });
    }
    catch (error) {
        console.error('Delete test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/grade', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, marks } = req.body;
        const test = await index_js_1.prisma.test.findUnique({
            where: { id },
        });
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        const percentage = (marks / test.totalMarks) * 100;
        const score = await index_js_1.prisma.testScore.upsert({
            where: {
                testId_studentId: {
                    testId: id,
                    studentId,
                },
            },
            update: {
                marks,
                percentage,
            },
            create: {
                testId: id,
                studentId,
                marks,
                percentage,
            },
            include: { student: true },
        });
        return res.status(201).json(score);
    }
    catch (error) {
        console.error('Grade test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id/export', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const test = await index_js_1.prisma.test.findUnique({
            where: { id: req.params.id },
            include: {
                class: true,
                scores: {
                    include: { student: true },
                    orderBy: { percentage: 'desc' },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        const csv = [
            ['Rank', 'Student Name', 'Marks', 'Percentage', 'Grade'].join(','),
            ...test.scores.map((score, index) => [
                index + 1,
                `${score.student.firstName} ${score.student.lastName}`,
                `${score.marks}/${test.totalMarks}`,
                `${score.percentage.toFixed(1)}%`,
                score.percentage >= 90 ? 'A' : score.percentage >= 80 ? 'B' : score.percentage >= 70 ? 'C' : score.percentage >= 60 ? 'D' : 'F',
            ].join(',')),
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${test.title.replace(/ /g, '_')}_results.csv"`);
        return res.send(csv);
    }
    catch (error) {
        console.error('Export test error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=test.routes.js.map
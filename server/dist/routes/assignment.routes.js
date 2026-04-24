"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const { page = '1', limit = '10', search, classId, status } = req.query;
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
        const [assignments, total] = await Promise.all([
            index_js_1.prisma.assignment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { dueDate: 'desc' },
                include: {
                    class: true,
                    teacher: true,
                    _count: { select: { submissions: true } },
                },
            }),
            index_js_1.prisma.assignment.count({ where }),
        ]);
        return res.json({
            assignments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get assignments error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const assignment = await index_js_1.prisma.assignment.findUnique({
            where: { id: req.params.id },
            include: {
                class: true,
                teacher: true,
                submissions: {
                    include: { student: true },
                },
            },
        });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        return res.json(assignment);
    }
    catch (error) {
        console.error('Get assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const data = req.body;
        const assignment = await index_js_1.prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: new Date(data.dueDate),
                maxScore: data.maxScore,
                attachments: data.attachments || [],
                classId: data.classId,
                teacherId: data.teacherId,
            },
            include: { class: true, teacher: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Assignment Created',
                details: `${assignment.title} created for ${assignment.class.name}`,
                userId: req.user.id,
                teacherId: data.teacherId,
            },
        });
        return res.status(201).json(assignment);
    }
    catch (error) {
        console.error('Create assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const assignment = await index_js_1.prisma.assignment.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                maxScore: data.maxScore,
                attachments: data.attachments,
            },
        });
        return res.json(assignment);
    }
    catch (error) {
        console.error('Update assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await index_js_1.prisma.assignment.delete({
            where: { id: req.params.id },
        });
        return res.json({ message: 'Assignment deleted successfully' });
    }
    catch (error) {
        console.error('Delete assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/submit', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.STUDENT), async (req, res) => {
    try {
        const { id } = req.params;
        const { fileUrl } = req.body;
        const assignment = await index_js_1.prisma.assignment.findUnique({
            where: { id },
            include: { class: true },
        });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        const student = await index_js_1.prisma.student.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }
        const isLate = new Date() > assignment.dueDate;
        const submission = await index_js_1.prisma.submission.upsert({
            where: {
                assignmentId_studentId: {
                    assignmentId: id,
                    studentId: student.id,
                },
            },
            update: {
                fileUrl,
                status: client_1.AssignmentStatus.SUBMITTED,
                submittedAt: new Date(),
            },
            create: {
                assignmentId: id,
                studentId: student.id,
                fileUrl,
                status: isLate ? client_1.AssignmentStatus.LATE : client_1.AssignmentStatus.SUBMITTED,
                submittedAt: new Date(),
            },
            include: { student: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Submission Received',
                details: `${submission.student.firstName} submitted ${assignment.title}`,
                userId: req.user.id,
                studentId: student.id,
            },
        });
        return res.status(201).json(submission);
    }
    catch (error) {
        console.error('Submit assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id/grade/:studentId', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const { score } = req.body;
        const submission = await index_js_1.prisma.submission.update({
            where: {
                assignmentId_studentId: {
                    assignmentId: id,
                    studentId,
                },
            },
            data: {
                score,
                gradedAt: new Date(),
            },
        });
        return res.json(submission);
    }
    catch (error) {
        console.error('Grade submission error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map
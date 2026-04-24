"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const { page = '1', limit = '10', search, status, teacherId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (teacherId) {
            where.teacherId = teacherId;
        }
        const [classes, total] = await Promise.all([
            index_js_1.prisma.class.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    teacher: true,
                    _count: {
                        select: { enrollments: true, assignments: true, tests: true },
                    },
                },
            }),
            index_js_1.prisma.class.count({ where }),
        ]);
        return res.json({
            classes,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get classes error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const classData = await index_js_1.prisma.class.findUnique({
            where: { id: req.params.id },
            include: {
                teacher: true,
                enrollments: {
                    include: { student: true },
                },
                assignments: {
                    orderBy: { dueDate: 'desc' },
                },
                tests: {
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        return res.json(classData);
    }
    catch (error) {
        console.error('Get class error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const data = req.body;
        const classData = await index_js_1.prisma.class.create({
            data: {
                code: data.code,
                name: data.name,
                subject: data.subject,
                description: data.description,
                room: data.room,
                schedule: data.schedule,
                teacherId: data.teacherId,
                status: client_1.ClassStatus.ACTIVE,
            },
            include: { teacher: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Class Created',
                details: `${classData.name} (${classData.code}) created`,
                userId: req.user.id,
            },
        });
        return res.status(201).json(classData);
    }
    catch (error) {
        console.error('Create class error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const classData = await index_js_1.prisma.class.update({
            where: { id },
            data: {
                name: data.name,
                subject: data.subject,
                description: data.description,
                room: data.room,
                schedule: data.schedule,
                status: data.status,
            },
            include: { teacher: true },
        });
        return res.json(classData);
    }
    catch (error) {
        console.error('Update class error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/archive', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        const { id } = req.params;
        const classData = await index_js_1.prisma.class.update({
            where: { id },
            data: { status: client_1.ClassStatus.ARCHIVED },
        });
        return res.json(classData);
    }
    catch (error) {
        console.error('Archive class error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await index_js_1.prisma.class.delete({
            where: { id: req.params.id },
        });
        return res.json({ message: 'Class deleted successfully' });
    }
    catch (error) {
        console.error('Delete class error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/enroll', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;
        const enrollment = await index_js_1.prisma.enrollRequest.create({
            data: {
                studentId,
                classId: id,
            },
            include: { student: true, class: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Student Enrolled',
                details: `${enrollment.student.firstName} enrolled in ${enrollment.class.name}`,
                userId: req.user.id,
            },
        });
        return res.status(201).json(enrollment);
    }
    catch (error) {
        console.error('Enroll student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id/enroll/:studentId', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        await index_js_1.prisma.enrollRequest.delete({
            where: {
                studentId_classId: {
                    studentId: req.params.studentId,
                    classId: req.params.id,
                },
            },
        });
        return res.json({ message: 'Student unenrolled successfully' });
    }
    catch (error) {
        console.error('Unenroll student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=class.routes.js.map
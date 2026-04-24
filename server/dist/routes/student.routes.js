"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, async (req, res) => {
    try {
        const { page = '1', limit = '10', search, status, classId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (classId) {
            where.enrollments = { some: { classId: classId } };
        }
        const [students, total] = await Promise.all([
            index_js_1.prisma.student.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    enrollments: {
                        include: { class: true },
                    },
                },
            }),
            index_js_1.prisma.student.count({ where }),
        ]);
        return res.json({
            students,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get students error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const student = await index_js_1.prisma.student.findUnique({
            where: { id: req.params.id },
            include: {
                enrollments: {
                    include: { class: true },
                },
                submissions: {
                    include: { assignment: true },
                },
                testScores: {
                    include: { test: true },
                },
            },
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        return res.json(student);
    }
    catch (error) {
        console.error('Get student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const data = req.body;
        const student = await index_js_1.prisma.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                email: data.email,
                phone: data.phone,
                address: data.address,
                enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
                graduationYear: data.graduationYear,
                status: data.status || 'ACTIVE',
                user: {
                    create: {
                        email: data.email,
                        password: data.password || 'defaultpassword123',
                        role: client_1.UserRole.STUDENT,
                    },
                },
            },
            include: { user: true },
        });
        await index_js_1.prisma.activityLog.create({
            data: {
                action: 'Student Created',
                details: `${student.firstName} ${student.lastName} added to system`,
                userId: req.user.id,
                studentId: student.id,
            },
        });
        return res.status(201).json(student);
    }
    catch (error) {
        console.error('Create student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.TEACHER), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const student = await index_js_1.prisma.student.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                email: data.email,
                phone: data.phone,
                address: data.address,
                graduationYear: data.graduationYear,
                status: data.status,
            },
        });
        return res.json(student);
    }
    catch (error) {
        console.error('Update student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_js_1.authenticate, (0, auth_js_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await index_js_1.prisma.student.delete({
            where: { id: req.params.id },
        });
        return res.json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error('Delete student error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=student.routes.js.map
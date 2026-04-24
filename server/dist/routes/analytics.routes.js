"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/student/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const student = await index_js_1.prisma.student.findUnique({
            where: { id },
            include: {
                submissions: {
                    include: { assignment: true },
                    orderBy: { createdAt: 'asc' },
                },
                testScores: {
                    include: { test: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const assignmentScores = student.submissions
            .filter((s) => s.score !== null)
            .map((s) => ({
            name: s.assignment.title,
            score: s.score,
            maxScore: s.assignment.maxScore,
            percentage: (s.score / s.assignment.maxScore) * 100,
            date: s.gradedAt,
        }));
        const testScores = student.testScores.map((ts) => ({
            name: ts.test.title,
            marks: ts.marks,
            totalMarks: ts.test.totalMarks,
            percentage: ts.percentage,
            date: ts.gradedAt,
        }));
        const assignmentCompletionRate = student.submissions.length > 0
            ? (student.submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'LATE').length / student.submissions.length) * 100
            : 0;
        const averageTestPercentage = student.testScores.length > 0
            ? student.testScores.reduce((sum, ts) => sum + ts.percentage, 0) / student.testScores.length
            : 0;
        return res.json({
            assignmentScores,
            testScores,
            assignmentCompletionRate,
            averageTestPercentage,
            overallAverage: (assignmentCompletionRate + averageTestPercentage) / 2,
        });
    }
    catch (error) {
        console.error('Get student analytics error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/class/:id', auth_js_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const classData = await index_js_1.prisma.class.findUnique({
            where: { id },
            include: {
                enrollments: {
                    include: { student: true },
                },
                assignments: {
                    include: { submissions: true },
                },
                tests: {
                    include: { scores: true },
                },
            },
        });
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const allScores = classData.tests.flatMap((t) => t.scores);
        const averageScore = allScores.length > 0
            ? allScores.reduce((sum, s) => sum + s.percentage, 0) / allScores.length
            : 0;
        const topPerformers = allScores
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5)
            .map((s) => {
            const student = classData.enrollments.find((e) => e.studentId === s.studentId)?.student;
            return {
                id: s.studentId,
                name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                percentage: s.percentage,
            };
        });
        const assignmentCompletionRate = classData.assignments.length > 0
            ? (classData.assignments.reduce((sum, a) => sum +
                a.submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'LATE').length, 0) /
                (classData.assignments.length * classData.enrollments.length || 1)) *
                100
            : 0;
        return res.json({
            averageScore,
            topPerformers,
            assignmentCompletionRate,
            totalStudents: classData.enrollments.length,
            totalAssignments: classData.assignments.length,
            totalTests: classData.tests.length,
        });
    }
    catch (error) {
        console.error('Get class analytics error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/overview', auth_js_1.authenticate, async (req, res) => {
    try {
        const [totalStudents, totalClasses, totalAssignments, totalTests, submissions, testScores,] = await Promise.all([
            index_js_1.prisma.student.count(),
            index_js_1.prisma.class.count({ where: { status: 'ACTIVE' } }),
            index_js_1.prisma.assignment.count(),
            index_js_1.prisma.test.count(),
            index_js_1.prisma.submission.findMany({
                where: { score: { not: null } },
                select: { score: true, assignment: { select: { maxScore: true } } },
            }),
            index_js_1.prisma.testScore.findMany({
                select: { percentage: true },
            }),
        ]);
        const assignmentAvg = submissions.length > 0
            ? (submissions.reduce((sum, s) => sum + (s.score / s.assignment.maxScore) * 100, 0) /
                submissions.length)
            : 0;
        const testAvg = testScores.length > 0
            ? testScores.reduce((sum, s) => sum + s.percentage, 0) / testScores.length
            : 0;
        return res.json({
            totalStudents,
            totalClasses,
            totalAssignments,
            totalTests,
            assignmentAverage: assignmentAvg,
            testAverage: testAvg,
            overallAverage: (assignmentAvg + testAvg) / 2,
        });
    }
    catch (error) {
        console.error('Get overview analytics error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map
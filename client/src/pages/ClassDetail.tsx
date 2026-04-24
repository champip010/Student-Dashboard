import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { classService, studentService, analyticsService } from '../services/api';
import { Class, Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [classResult, analyticsResult, studentList] = await Promise.all([
          classService.getById(id),
          analyticsService.getClassAnalytics(id),
          studentService.getAll({ limit: 100 }),
        ]);
        setClassData(classResult);
        setAnalytics(analyticsResult);
        setStudents(studentList.students.filter(
          (s: Student) => !classResult.enrollments?.some((e: any) => e.studentId === s.id)
        ));
      } catch (error) {
        console.error('Failed to fetch class:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnroll = async (studentId: string) => {
    if (!id) return;
    try {
      await classService.enrollStudent(id, studentId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to enroll student:', error);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!id || !confirm('Are you sure?')) return;
    try {
      await classService.unenrollStudent(id, studentId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to unenroll student:', error);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm('Are you sure you want to archive this class?')) return;
    try {
      await classService.archive(id);
      navigate('/classes');
    } catch (error) {
      console.error('Failed to archive class:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return <div className="text-center py-12 text-gray-500">Class not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/classes" className="text-gray-500 hover:text-gray-700">← Back to Classes</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{classData.name}</h1>
                <p className="text-gray-500">{classData.code} • {classData.subject}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                classData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {classData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{classData.enrollments?.length || 0}</p>
                <p className="text-sm text-gray-500">Students</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{classData.assignments?.length || 0}</p>
                <p className="text-sm text-gray-500">Assignments</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{classData.tests?.length || 0}</p>
                <p className="text-sm text-gray-500">Tests</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{analytics?.averageScore?.toFixed(1) || 0}%</p>
                <p className="text-sm text-gray-500">Avg Score</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📍</span>
                <span>{classData.room || 'No room'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <span>{classData.schedule || 'No schedule'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">👨‍🏫</span>
                <span>{classData.teacher?.firstName} {classData.teacher?.lastName}</span>
              </div>
            </div>

            {classData.description && (
              <p className="mt-4 text-gray-600">{classData.description}</p>
            )}
          </div>

          {analytics?.topPerformers?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topPerformers.map((p: any) => ({ name: p.name.split(' ')[0], percentage: p.percentage }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {user?.role !== 'STUDENT' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Class Roster</h3>
                <button onClick={() => setShowEnrollModal(true)} className="btn btn-primary text-sm py-1">
                  + Enroll
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {classData.enrollments?.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Link to={`/students/${enrollment.studentId}`} className="text-sm text-blue-600 hover:underline">
                      {enrollment.student?.firstName} {enrollment.student?.lastName}
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <button onClick={() => handleUnenroll(enrollment.studentId)} className="text-red-500 text-sm">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {(!classData.enrollments || classData.enrollments.length === 0) && (
                  <p className="text-center text-gray-500 text-sm py-4">No students enrolled</p>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Upcoming Assignments</h3>
            <div className="space-y-3">
              {classData.assignments?.slice(0, 3).map((assignment) => (
                <Link key={assignment.id} to={`/assignments/${assignment.id}`} className="block p-3 bg-gray-50 rounded hover:bg-gray-100">
                  <p className="font-medium text-gray-800 text-sm">{assignment.title}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </Link>
              ))}
              {(!classData.assignments || classData.assignments.length === 0) && (
                <p className="text-center text-gray-500 text-sm py-4">No assignments</p>
              )}
            </div>
          </div>

          {user?.role === 'ADMIN' && classData.status === 'ACTIVE' && (
            <button onClick={handleArchive} className="btn btn-secondary w-full">
              Archive Class
            </button>
          )}
        </div>
      </div>

      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enroll Student</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleEnroll(student.id)}
                  className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100"
                >
                  {student.firstName} {student.lastName}
                </button>
              ))}
            </div>
            <button onClick={() => setShowEnrollModal(false)} className="btn btn-secondary w-full mt-4">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
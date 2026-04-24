import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService, analyticsService } from '../services/api';
import { Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [studentData, analyticsData] = await Promise.all([
          studentService.getById(id),
          analyticsService.getStudentAnalytics(id),
        ]);
        setStudent(studentData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to fetch student:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      navigate('/students');
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-12 text-gray-500">Student not found</div>;
  }

  const chartData = [
    ...(analytics?.assignmentScores || []).map((s: any) => ({
      name: s.name.slice(0, 15),
      score: s.percentage,
    })),
    ...(analytics?.testScores || []).map((s: any) => ({
      name: s.name.slice(0, 15),
      score: s.percentage,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students" className="text-gray-500 hover:text-gray-700">← Back to Students</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-4">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-500">{student.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {student.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{student.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrollment Date</p>
                <p className="font-medium">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Graduation Year</p>
                <p className="font-medium">{student.graduationYear || '-'}</p>
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button onClick={handleDelete} className="btn btn-danger w-full">
                  Delete Student
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-gray-500 text-sm">Assignment Completion</p>
              <p className="text-2xl font-bold text-blue-600">{analytics?.assignmentCompletionRate?.toFixed(1) || 0}%</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500 text-sm">Avg Test Score</p>
              <p className="text-2xl font-bold text-green-600">{analytics?.averageTestPercentage?.toFixed(1) || 0}%</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500 text-sm">Overall Average</p>
              <p className="text-2xl font-bold text-purple-600">{analytics?.overallAverage?.toFixed(1) || 0}%</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500 text-sm">Classes</p>
              <p className="text-2xl font-bold text-orange-600">{student.enrollments?.length || 0}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Over Time</h3>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No performance data available</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrolled Classes</h3>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="space-y-3">
                {student.enrollments.map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    to={`/classes/${enrollment.classId}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <p className="font-medium text-gray-800">{enrollment.class?.name}</p>
                    <p className="text-sm text-gray-500">{enrollment.class?.code} • {enrollment.class?.subject}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No enrollments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
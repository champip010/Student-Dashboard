import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testService } from '../services/api';
import { Test } from '../types';
import { useAuth } from '../context/AuthContext';

const TestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [marks, setMarks] = useState('');

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        const data = await testService.getById(id);
        setTest(data);
      } catch (error) {
        console.error('Failed to fetch test:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleGrade = async (studentId: string) => {
    if (!id || !marks) return;
    try {
      await testService.grade(id, studentId, parseInt(marks));
      window.location.reload();
    } catch (error) {
      console.error('Failed to grade:', error);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const blob = await testService.export(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_results_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return <div className="text-center py-12 text-gray-500">Test not found</div>;
  }

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/tests" className="text-gray-500 hover:text-gray-700">← Back to Tests</Link>
        {isTeacher && (
          <button onClick={handleExport} className="btn btn-primary">
            Export Results (CSV)
          </button>
        )}
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
        <p className="text-gray-500">{test.class?.name}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{new Date(test.date).toLocaleDateString()}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{test.duration} minutes</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Marks</p>
            <p className="font-medium">{test.totalMarks}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Submissions</p>
            <p className="font-medium">{test.scores?.length || 0}</p>
          </div>
        </div>

        {test.syllabus && (
          <div className="mt-6">
            <p className="text-sm text-gray-500">Syllabus</p>
            <p className="text-gray-800">{test.syllabus}</p>
          </div>
        )}
      </div>

      {isTeacher && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Student Scores</h3>
          <div className="space-y-3">
            {test.scores?.map((score) => (
              <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {score.student?.firstName} {score.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {score.marks}/{test.totalMarks} ({score.percentage.toFixed(1)}%)
                  </p>
                </div>
                {grading === score.studentId ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="input py-1 w-20"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      max={test.totalMarks}
                    />
                    <button onClick={() => handleGrade(score.studentId!)} className="btn btn-primary py-1">Save</button>
                  </div>
                ) : (
                  <button onClick={() => setGrading(score.studentId!)} className="btn btn-secondary py-1">Update</button>
                )}
              </div>
            ))}
            {(!test.scores || test.scores.length === 0) && (
              <p className="text-center text-gray-500 py-4">No scores recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDetail;
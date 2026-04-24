import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assignmentService } from '../services/api';
import { Assignment } from '../types';
import { useAuth } from '../context/AuthContext';

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [score, setScore] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;
      try {
        const data = await assignmentService.getById(id);
        setAssignment(data);
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    try {
      await assignmentService.submit(id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  const handleGrade = async (studentId: string) => {
    if (!id || !score) return;
    try {
      await assignmentService.grade(id, studentId, parseInt(score));
      window.location.reload();
    } catch (error) {
      console.error('Failed to grade:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    try {
      await assignmentService.delete(id);
      navigate('/assignments');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return <div className="text-center py-12 text-gray-500">Assignment not found</div>;
  }

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const studentSubmission = isStudent
    ? assignment.submissions?.find((s) => s.student?.userId === user?.id)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/assignments" className="text-gray-500 hover:text-gray-700">← Back to Assignments</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-800">{assignment.title}</h1>
            <p className="text-gray-500 mt-1">{assignment.class?.name}</p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-800">{assignment.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{new Date(assignment.dueDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maximum Score</p>
                  <p className="font-medium">{assignment.maxScore}</p>
                </div>
              </div>
            </div>

            {isStudent && !studentSubmission && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 mb-4">You haven't submitted this assignment yet.</p>
                <button onClick={handleSubmit} className="btn btn-primary">Submit Assignment</button>
              </div>
            )}

            {isStudent && studentSubmission && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">Submitted</p>
                {studentSubmission.score !== null && (
                  <p className="text-green-700 mt-2">Score: {studentSubmission.score}/{assignment.maxScore}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {isTeacher && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Submissions ({assignment.submissions?.length || 0})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assignment.submissions?.map((submission) => (
                  <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">
                        {submission.student?.firstName} {submission.student?.lastName}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        submission.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                        submission.status === 'LATE' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                    {submission.score !== null && (
                      <p className="text-sm text-gray-600 mt-1">Score: {submission.score}/{assignment.maxScore}</p>
                    )}
                    {grading === submission.studentId ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="number"
                          className="input py-1 text-sm"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="Score"
                          max={assignment.maxScore}
                        />
                        <button onClick={() => handleGrade(submission.studentId)} className="btn btn-primary py-1 text-sm">Save</button>
                      </div>
                    ) : (
                      <button onClick={() => setGrading(submission.studentId!)} className="text-sm text-blue-600 mt-1">
                        {submission.score !== null ? 'Update Grade' : 'Grade'}
                      </button>
                    )}
                  </div>
                ))}
                {(!assignment.submissions || assignment.submissions.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No submissions yet</p>
                )}
              </div>
            </div>
          )}
          
          {isTeacher && (
            <div className="space-y-3">
              <Link to={`/assignments/${id}/edit`} className="btn btn-primary w-full">
                Edit Assignment
              </Link>
              <button onClick={handleDelete} className="btn btn-danger w-full">
                Delete Assignment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
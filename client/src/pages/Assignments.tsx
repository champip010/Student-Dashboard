import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentService } from '../services/api';
import { Assignment, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchAssignments = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const data = await assignmentService.getAll({ page, limit: 10, search: searchQuery || undefined });
      setAssignments(data.assignments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssignments(1, search);
  };

  const getStatusBadge = (dueDate: string, submissions: any[] = []) => {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) {
      const submitted = submissions.length;
      if (submitted > 0) return 'bg-green-100 text-green-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-500">Track and manage assignments</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <Link to="/assignments/new" className="btn btn-primary">
            + Create Assignment
          </Link>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search assignments..."
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">{assignment.class?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(assignment.dueDate, assignment.submissions)}`}>
                      {new Date(assignment.dueDate) < new Date() ? 'Past Due' : 'Active'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p>📊 Max Score: {assignment.maxScore}</p>
                    <p>👥 Submissions: {(assignment as any)._count?.submissions || 0}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchAssignments(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-secondary">Previous</button>
                <button onClick={() => fetchAssignments(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn btn-secondary">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assignments;
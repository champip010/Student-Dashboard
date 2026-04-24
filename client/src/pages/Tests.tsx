import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../services/api';
import { Test, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';

const Tests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchTests = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const data = await testService.getAll({ page, limit: 10, search: searchQuery || undefined });
      setTests(data.tests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTests(1, search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tests & Examinations</h1>
          <p className="text-gray-500">Schedule and manage tests</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <Link to="/tests/new" className="btn btn-primary">
            + Schedule Test
          </Link>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tests..."
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Total Marks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{test.title}</td>
                      <td className="py-3 px-4 text-gray-600">{test.class?.name}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(test.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-600">{test.duration} min</td>
                      <td className="py-3 px-4 text-gray-600">{test.totalMarks}</td>
                      <td className="py-3 px-4">
                        <Link to={`/tests/${test.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchTests(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-secondary">Previous</button>
                <button onClick={() => fetchTests(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn btn-secondary">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tests;
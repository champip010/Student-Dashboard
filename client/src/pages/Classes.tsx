import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classService } from '../services/api';
import { Class, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  const fetchClasses = async (page = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const data = await classService.getAll({
        page,
        limit: 10,
        search: searchQuery || undefined,
        status: status || undefined,
      });
      setClasses(data.classes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClasses(1, search, statusFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchClasses(newPage, search, statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          <p className="text-gray-500">Manage classes and enrollments</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <Link to="/classes/new" className="btn btn-primary">
            + Create Class
          </Link>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search classes..."
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchClasses(1, search, e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                      <p className="text-sm text-gray-500">{cls.code}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cls.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cls.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{cls.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">{cls.room || 'No room assigned'}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>👨‍🏫 {cls.teacher?.firstName} {cls.teacher?.lastName}</span>
                    <span>👥 {(cls as any)._count?.enrollments || 0}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Classes;
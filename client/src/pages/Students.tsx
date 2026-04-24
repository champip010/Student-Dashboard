import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api';
import { Student, PaginationInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();

  const fetchStudents = async (page = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const data = await studentService.getAll({
        page,
        limit: 10,
        search: searchQuery || undefined,
        status: status || undefined,
      });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1, search, statusFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchStudents(newPage, search, statusFilter);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('Students')}</h1>
          <p className="text-gray-500">{t('Manage student records')}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/students/new" className="btn btn-primary">
            + {t('Add Student')}
          </Link>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder={t('Search students...')}
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchStudents(1, search, e.target.value);
            }}
          >
            <option value="">{t('All Status')}</option>
            <option value="ACTIVE">{t('Active')}</option>
            <option value="INACTIVE">{t('Inactive')}</option>
            <option value="GRADUATED">{t('Graduated')}</option>
          </select>
          <button type="submit" className="btn btn-primary">
            {t('Search')}
          </button>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Name')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('ID')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Email')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Status')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Graduation')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <span className="font-medium text-gray-800">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(student.status)}`}>
                          {t(student.status.charAt(0) + student.status.slice(1).toLowerCase())}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.graduationYear || '-'}</td>
                      <td className="py-3 px-4">
                        <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800">
                          {t('View')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-500">
                {t('Showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('of')} {pagination.total} {t('results')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  {t('Previous')}
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-secondary"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Students;
import { useState, useEffect } from 'react';
import { researchService, studentService } from '../services/api';
import { ResearchProgress, Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ResearchTracker = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [records, setRecords] = useState<ResearchProgress[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    stage: 'IOC',
    status: 'IN_PROGRESS',
    remarks: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentIdToDelete, setStudentIdToDelete] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const stages = [
    'IOC',
    'Thesis First 3 Chapters',
    'IRB Waiting',
    'Data Collection',
    'Analysis',
    'Final Thesis',
  ];

  const statuses = ['IN_PROGRESS', 'COMPLETED', 'STUCK'];

  const fetchRecords = async (searchQuery = search, stage = stageFilter, status = statusFilter) => {
    setLoading(true);
    try {
      const data = await researchService.getAll({ 
        search: searchQuery || undefined,
        stage: stage || undefined,
        status: status || undefined
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch research records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll({ limit: 100 });
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    if (user?.role !== 'STUDENT') {
      fetchStudents();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(search, stageFilter, statusFilter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await researchService.update(formData);
      setShowModal(false);
      fetchRecords();
      setFormData({ studentId: '', stage: 'IOC', status: 'IN_PROGRESS', remarks: '' });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await researchService.delete(studentIdToDelete);
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete progress:', error);
    } finally {
      setShowDeleteModal(false);
      setStudentIdToDelete('');
    }
  };

  const openDeleteModal = (studentId: string) => {
    setStudentIdToDelete(studentId);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'STUCK': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStageDisplay = (stage: string) => {
    return t(stage);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return t('In Progress');
      case 'COMPLETED': return t('Completed');
      case 'STUCK': return t('Stuck');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('Research Tracker')}</h1>
          <p className="text-gray-500">{t('Monitor student research milestones')}</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + {t('Update Progress')}
          </button>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder={t('Search students...')}
            className="input flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-48"
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              fetchRecords(search, e.target.value, statusFilter);
            }}
          >
            <option value="">{t('All Stages')}</option>
            {stages.map((s) => (
              <option key={s} value={s}>{getStageDisplay(s)}</option>
            ))}
          </select>
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchRecords(search, stageFilter, e.target.value);
            }}
          >
            <option value="">{t('All Status')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{getStatusDisplay(s)}</option>
            ))}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Student')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Research Stage')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Status')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Last Updated')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Remarks')}</th>
                  {user?.role === 'ADMIN' && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{t('Actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">
                        {record.student?.firstName} {record.student?.lastName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{getStageDisplay(record.stage)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusDisplay(record.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(record.lastUpdated).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm italic max-w-xs truncate">
                      {record.remarks || '-'}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => openDeleteModal(record.studentId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('Update Research Progress')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t('Select Student')}</label>
                <select
                  className="input"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">{t('Select Student')}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('Research Stage')}</label>
                <select
                  className="input"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>{getStageDisplay(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('Research Status')}</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{getStatusDisplay(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('Remarks')}</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {t('Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('Delete Research Progress')}</h3>
            <p className="mb-6">{t('Are you sure you want to delete this research progress record? This action cannot be undone.')}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary flex-1">
                {t('Cancel')}
              </button>
              <button type="button" onClick={handleDelete} className="btn btn-danger flex-1">
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTracker;

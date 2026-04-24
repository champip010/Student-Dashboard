import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assignmentService, classService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Class } from '../types';

const AssignmentForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    classId: '',
    teacherId: user?.teacherProfile?.id || '',
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAll({ limit: 100 });
        setClasses(data.classes);
      } catch (err) {
        console.error('Failed to fetch classes');
      }
    };

    const fetchAssignment = async () => {
      try {
        const assignment = await assignmentService.getById(id!);
        setFormData({
          title: assignment.title,
          description: assignment.description || '',
          dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
          maxScore: assignment.maxScore,
          classId: assignment.classId,
          teacherId: assignment.teacherId,
        });
      } catch (err) {
        setError('Failed to fetch assignment data');
      }
    };

    fetchClasses();
    if (isEdit) {
      fetchAssignment();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await assignmentService.update(id!, formData);
      } else {
        await assignmentService.create(formData);
      }
      navigate('/assignments');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? t('Edit Assignment') : t('Create Assignment')}
        </h1>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('Title')}</label>
            <input
              type="text"
              className="input"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="label">{t('Class')}</label>
            <select
              className="input"
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              <option value="">{t('Select Class')}</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Due Date')}</label>
              <input
                type="datetime-local"
                className="input"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('Max Score')}</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">{t('Description')}</label>
            <textarea
              className="input"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/assignments')}
              className="btn btn-secondary flex-1"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? t('Saving...') : t('Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;

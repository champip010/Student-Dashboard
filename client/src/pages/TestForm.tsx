import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testService, classService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Class } from '../types';

const TestForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    duration: 60,
    totalMarks: 100,
    syllabus: '',
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

    const fetchTest = async () => {
      try {
        const test = await testService.getById(id!);
        setFormData({
          title: test.title,
          date: new Date(test.date).toISOString().slice(0, 16),
          duration: test.duration,
          totalMarks: test.totalMarks,
          syllabus: test.syllabus || '',
          classId: test.classId,
          teacherId: test.teacherId,
        });
      } catch (err) {
        setError('Failed to fetch test data');
      }
    };

    fetchClasses();
    if (isEdit) {
      fetchTest();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await testService.update(id!, formData);
      } else {
        await testService.create(formData);
      }
      navigate('/tests');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? t('Edit Test') : t('Create Test')}
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
              <label className="label">{t('Test Date')}</label>
              <input
                type="datetime-local"
                className="input"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('Duration (minutes)')}</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">{t('Total Marks')}</label>
            <input
              type="number"
              className="input"
              required
              min="1"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">{t('Syllabus')}</label>
            <textarea
              className="input"
              rows={4}
              value={formData.syllabus}
              onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/tests')}
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

export default TestForm;
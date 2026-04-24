import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { classService, userService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Teacher } from '../types';

const ClassForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subject: '',
    description: '',
    room: '',
    schedule: '',
    teacherId: '',
    status: 'ACTIVE',
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await userService.getTeachers();
        setTeachers(data);
      } catch (err) {
        console.error('Failed to fetch teachers');
      }
    };

    const fetchClass = async () => {
      try {
        const classData = await classService.getById(id!);
        setFormData({
          code: classData.code,
          name: classData.name,
          subject: classData.subject,
          description: classData.description || '',
          room: classData.room || '',
          schedule: classData.schedule || '',
          teacherId: classData.teacherId,
          status: classData.status,
        });
      } catch (err) {
        setError('Failed to fetch class data');
      }
    };

    fetchTeachers();
    if (isEdit) {
      fetchClass();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await classService.update(id!, formData);
      } else {
        await classService.create(formData);
      }
      navigate('/classes');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? t('Edit Class') : t('Create Class')}
        </h1>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Class Code')}</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. MATH101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="label">{t('Class Name')}</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">{t('Subject')}</label>
            <input
              type="text"
              className="input"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="label">{t('Teacher')}</label>
            <select
              className="input"
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">{t('Select Teacher')}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Room')}</label>
              <input
                type="text"
                className="input"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('Status')}</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">{t('Active')}</option>
                <option value="ARCHIVED">{t('Archived')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t('Schedule')}</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Mon, Wed 10:00 AM"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            />
          </div>

          <div>
            <label className="label">{t('Description')}</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/classes')}
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

export default ClassForm;

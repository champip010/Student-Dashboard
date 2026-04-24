import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../services/api';
import { useTranslation } from 'react-i18next';

const StudentForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    graduationYear: new Date().getFullYear() + 4,
    status: 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const student = await studentService.getById(id);
          setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            phone: student.phone || '',
            address: student.address || '',
            graduationYear: student.graduationYear || new Date().getFullYear() + 4,
            status: student.status,
          });
        } catch (err) {
          setError('Failed to fetch student data');
        }
      };
      fetchStudent();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        if (!id) return;
        await studentService.update(id, formData);
      } else {
        await studentService.create(formData);
      }
      navigate('/students');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? t('Edit Student') : t('Add Student')}
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
              <label className="label">{t('First Name')}</label>
              <input
                type="text"
                className="input"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('Last Name')}</label>
              <input
                type="text"
                className="input"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">{t('Email')}</label>
            <input
              type="email"
              className="input"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Date of Birth')}</label>
              <input
                type="date"
                className="input"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('Phone')}</label>
              <input
                type="text"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">{t('Address')}</label>
            <textarea
              className="input"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Graduation Year')}</label>
              <input
                type="number"
                className="input"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
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
                <option value="INACTIVE">{t('Inactive')}</option>
                <option value="GRADUATED">{t('Graduated')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/students')}
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

export default StudentForm;

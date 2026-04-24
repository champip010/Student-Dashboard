import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-500 mt-2">{t('Sign in to your account')}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">{t('Email')}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Email')}
              required
            />
          </div>

          <div>
            <label className="label">{t('Password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('Password')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg"
          >
            {loading ? t('Signing in...') : t('Sign In')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="font-semibold mb-2">{t('Demo Credentials')}:</p>
          <div className="space-y-1">
            <p>{t('Admin')}: admin@school.edu / admin123</p>
            <p>{t('Teacher')}: teacher@school.edu / teacher123</p>
            <p>{t('Student')}: student@school.edu / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

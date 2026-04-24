import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { DashboardData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await dashboardService.getData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return t('Just now');
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('Dashboard')}</h1>
          <p className="text-gray-500">
            {t('Welcome')}, {user?.teacherProfile?.firstName || user?.studentProfile?.firstName || 'User'}
          </p>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
            <>
              <Link to="/students" className="btn btn-primary">
                + {t('Add Student')}
              </Link>
              <Link to="/assignments" className="btn btn-secondary">
                + {t('Create Assignment')}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">{t('Total Students')}</p>
              <p className="text-3xl font-bold mt-1">{data?.kpis.totalStudents || 0}</p>
            </div>
            <div className="text-4xl opacity-80">👨‍🎓</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">{t('Active Classes')}</p>
              <p className="text-3xl font-bold mt-1">{data?.kpis.activeClasses || 0}</p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">{t('Pending Assignments')}</p>
              <p className="text-3xl font-bold mt-1">{data?.kpis.pendingAssignments || 0}</p>
            </div>
            <div className="text-4xl opacity-80">📝</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">{t('Upcoming Tests')}</p>
              <p className="text-3xl font-bold mt-1">{data?.kpis.upcomingTests || 0}</p>
            </div>
            <div className="text-4xl opacity-80">✍️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('Recent Activity')}</h2>
          <div className="space-y-4">
            {data?.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('No recent activity')}</p>
            ) : (
              data?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {activity.action.includes('Enroll') ? '📥' :
                     activity.action.includes('Create') ? '✨' :
                     activity.action.includes('Submit') ? '📤' :
                     activity.action.includes('Schedule') ? '📅' :
                     activity.action.includes('Grade') ? '✅' : '📌'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-sm">{activity.details}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatDate(activity.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('Quick Actions')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/students"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">👨‍🎓</div>
              <p className="font-medium text-gray-800">{t('View Students')}</p>
              <p className="text-sm text-gray-500">{t('Manage student records')}</p>
            </Link>
            <Link
              to="/classes"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <p className="font-medium text-gray-800">{t('Manage Classes')}</p>
              <p className="text-sm text-gray-500">{t('Class schedules & rosters')}</p>
            </Link>
            <Link
              to="/assignments"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <p className="font-medium text-gray-800">{t('Assignments')}</p>
              <p className="text-sm text-gray-500">{t('Track submissions')}</p>
            </Link>
            <Link
              to="/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-800">{t('Analytics')}</p>
              <p className="text-sm text-gray-500">{t('View performance charts')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
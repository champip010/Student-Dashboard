import { useState, useEffect } from 'react';
import { analyticsService, classService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [overview, setOverview] = useState<any>(null);
  const [classAnalytics, setClassAnalytics] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, classesData] = await Promise.all([
          analyticsService.getOverview(),
          classService.getAll({ limit: 100 }),
        ]);
        setOverview(overviewData);
        setClasses(classesData.classes);
        if (classesData.classes.length > 0) {
          setSelectedClass(classesData.classes[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClassAnalytics = async () => {
      if (!selectedClass) return;
      try {
        const data = await analyticsService.getClassAnalytics(selectedClass);
        setClassAnalytics((prev) => [...prev.filter((c) => c.id !== selectedClass), { id: selectedClass, ...data }]);
      } catch (error) {
        console.error('Failed to fetch class analytics:', error);
      }
    };
    fetchClassAnalytics();
  }, [selectedClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentClassAnalytics = classAnalytics.find((c) => c.id === selectedClass);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
        <p className="text-gray-500">Visualize student performance and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100">Total Students</p>
          <p className="text-3xl font-bold mt-1">{overview?.totalStudents || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100">Active Classes</p>
          <p className="text-3xl font-bold mt-1">{overview?.totalClasses || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-orange-100">Assignment Avg</p>
          <p className="text-3xl font-bold mt-1">{overview?.assignmentAverage?.toFixed(1) || 0}%</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100">Test Average</p>
          <p className="text-3xl font-bold mt-1">{overview?.testAverage?.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Performance Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Assignments', value: overview?.assignmentAverage || 0 },
                    { name: 'Tests', value: overview?.testAverage || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assignment Average</span>
                <span className="font-medium">{overview?.assignmentAverage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${overview?.assignmentAverage || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Test Average</span>
                <span className="font-medium">{overview?.testAverage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${overview?.testAverage || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Average</span>
                <span className="font-medium">{overview?.overallAverage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${overview?.overallAverage || 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Class-Level Analytics</h3>
            <select
              className="input w-64"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {currentClassAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{currentClassAnalytics.averageScore?.toFixed(1) || 0}%</p>
                  <p className="text-sm text-gray-500">Avg Score</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{currentClassAnalytics.totalStudents || 0}</p>
                  <p className="text-sm text-gray-500">Students</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{currentClassAnalytics.assignmentCompletionRate?.toFixed(1) || 0}%</p>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{currentClassAnalytics.totalTests || 0}</p>
                  <p className="text-sm text-gray-500">Tests</p>
                </div>
              </div>

              {currentClassAnalytics.topPerformers?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Top Performers</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentClassAnalytics.topPerformers.map((p: any) => ({
                        name: p.name.split(' ')[0],
                        percentage: p.percentage,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
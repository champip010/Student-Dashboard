import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Clock, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { ResearchProgress } from '../types';

// 1. Timeline Widget
export const TimelineWidget: React.FC<{ data: ResearchProgress[] }> = ({ data }) => {
  const { t } = useTranslation();
  const sortedData = [...data].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  
  const chartData = sortedData.map(record => ({
    name: record.student?.firstName || 'Student',
    stage: record.stage,
    date: new Date(record.updatedAt).toLocaleDateString(),
    timestamp: new Date(record.updatedAt).getTime()
  }));

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Clock size={16} /> {t('Research Timeline')}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" fontSize={10} />
            <YAxis type="category" dataKey="stage" fontSize={10} width={80} />
            <Tooltip />
            <Line type="stepAfter" dataKey="stage" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Milestone Tracker Widget
export const MilestoneTrackerWidget: React.FC<{ data: ResearchProgress[] }> = ({ data }) => {
  const { t } = useTranslation();
  const stageCounts = data.reduce((acc: any, curr) => {
    acc[curr.stage] = (acc[curr.stage] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(stageCounts).map(stage => ({
    name: t(stage),
    count: stageCounts[stage]
  }));

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <TrendingUp size={16} /> {t('Milestone Tracker')}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" fontSize={10} width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Upcoming Deadlines Widget
export const DeadlinesWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <AlertCircle size={16} className="text-orange-500" /> {t('Upcoming Deadlines')}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {data.length > 0 ? data.map((item, idx) => (
          <div key={idx} className="p-2 bg-orange-50 border-l-4 border-orange-500 rounded text-xs">
            <p className="font-bold text-orange-800">{item.title}</p>
            <p className="text-orange-600">{new Date(item.dueDate).toLocaleDateString()}</p>
          </div>
        )) : (
          <p className="text-gray-400 text-xs italic text-center py-4">{t('No upcoming deadlines')}</p>
        )}
      </div>
    </div>
  );
};

// 4. Action Items / Recommendations Widget
export const ActionItemsWidget: React.FC<{ data: ResearchProgress[] }> = ({ data }) => {
  const { t } = useTranslation();
  
  // Logic to generate recommendations based on data
  const generateRecommendations = () => {
    const recommendations: string[] = [];
    const stuckStudents = data.filter(r => r.status === 'STUCK');
    const iocStudents = data.filter(r => r.stage === 'IOC');
    
    if (stuckStudents.length > 0) {
      recommendations.push(t('Next Step Recommendation') + ': ' + t('Schedule meetings with students stuck in progress'));
    }
    if (iocStudents.length > 0) {
      recommendations.push(t('Next Step Recommendation') + ': ' + t('Review pending IOC proposals'));
    }
    
    return recommendations;
  };

  const items = generateRecommendations();

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Lightbulb size={16} className="text-yellow-500" /> {t('Recommended Actions')}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.length > 0 ? items.map((item, idx) => (
          <div key={idx} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded text-xs flex gap-2">
            <CheckCircle size={14} className="text-yellow-600 shrink-0" />
            <p className="text-yellow-800">{item}</p>
          </div>
        )) : (
          <p className="text-gray-400 text-xs italic text-center py-4">{t('No action items needed')}</p>
        )}
      </div>
    </div>
  );
};

// 5. Stats Summary Widget
export const StatsWidget: React.FC<{ data: ResearchProgress[] }> = ({ data }) => {
  const { t } = useTranslation();
  const completed = data.filter(r => r.status === 'COMPLETED').length;
  const inProgress = data.filter(r => r.status === 'IN_PROGRESS').length;
  const stuck = data.filter(r => r.status === 'STUCK').length;

  const pieData = [
    { name: t('Completed'), value: completed, color: '#10b981' },
    { name: t('In Progress'), value: inProgress, color: '#3b82f6' },
    { name: t('Stuck'), value: stuck, color: '#ef4444' }
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <TrendingUp size={16} /> {t('Research Statistics')}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={30}
              outerRadius={50}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 6. Class Overview Widget
export const ClassOverviewWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <TrendingUp size={16} /> {t('Class Overview')}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {data.length > 0 ? data.map((cls, idx) => (
          <div key={idx} className="p-3 bg-blue-50 rounded-lg text-xs">
            <div className="flex justify-between items-center">
              <p className="font-bold text-blue-800">{cls.name}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                cls.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {cls.status}
              </span>
            </div>
            <p className="text-blue-600 mt-1">{cls.code} • {cls.subject}</p>
            <p className="text-blue-600 mt-1">Students: {(cls as any)._count?.enrollments || 0}</p>
          </div>
        )) : (
          <p className="text-gray-400 text-xs italic text-center py-4">{t('No classes available')}</p>
        )}
      </div>
    </div>
  );
};

// 7. Test Performance Widget
export const TestPerformanceWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();
  
  const chartData = data.map(test => {
    const avgScore = test.scores?.length > 0 
      ? test.scores.reduce((sum: number, score: any) => sum + score.marks, 0) / test.scores.length
      : 0;
    return {
      name: test.title,
      average: avgScore,
      total: test.totalMarks
    };
  });

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <TrendingUp size={16} /> {t('Test Performance')}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="average" name="Average Score" fill="#3b82f6" />
            <Bar dataKey="total" name="Total Marks" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 8. Recent Assignments Widget
export const RecentAssignmentsWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Clock size={16} /> {t('Recent Assignments')}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {data.length > 0 ? data.map((assignment, idx) => (
          <div key={idx} className="p-2 bg-purple-50 border-l-4 border-purple-500 rounded text-xs">
            <p className="font-bold text-purple-800">{assignment.title}</p>
            <p className="text-purple-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p className="text-purple-600">Class: {assignment.class?.name}</p>
          </div>
        )) : (
          <p className="text-gray-400 text-xs italic text-center py-4">{t('No recent assignments')}</p>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Save, Edit3, X, GripVertical, Settings2, Trash2
} from 'lucide-react';
import { 
  TimelineWidget, MilestoneTrackerWidget, DeadlinesWidget, 
  ActionItemsWidget, StatsWidget, ClassOverviewWidget, 
  TestPerformanceWidget, RecentAssignmentsWidget 
} from '../components/DashboardWidgets';
import { researchService, assignmentService, classService, testService } from '../services/api';
import { ResearchProgress } from '../types';
import { WidgetConfig, WidgetType } from '../types/dashboard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const CustomDashboard = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [researchData, setResearchData] = useState<ResearchProgress[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  // Initial widgets and layout
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : [
      { id: 'w1', type: 'STATS', title: t('Research Statistics') },
      { id: 'w2', type: 'TIMELINE', title: t('Research Timeline') },
      { id: 'w3', type: 'MILESTONES', title: t('Milestone Tracker') },
      { id: 'w4', type: 'DEADLINES', title: t('Upcoming Deadlines') },
      { id: 'w5', type: 'ACTION_ITEMS', title: t('Recommended Actions') }
    ];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [research, assns, classList, testList] = await Promise.all([
          researchService.getAll(),
          assignmentService.getAll({ limit: 5 }),
          classService.getAll({ limit: 5 }),
          testService.getAll({ limit: 5 })
        ]);
        setResearchData(research);
        setDeadlines(assns.assignments);
        setClasses(classList.classes);
        setTests(testList.tests);
        setRecentAssignments(assns.assignments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveLayout = () => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets));
    setIsEditing(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const addWidget = (type: WidgetType, title: string) => {
    const id = `w_${Date.now()}`;
    const newWidget: WidgetConfig = { id, type, title };
    setWidgets([...widgets, newWidget]);
    setShowWidgetLibrary(false);
  };

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'TIMELINE': return <TimelineWidget data={researchData} />;
      case 'MILESTONES': return <MilestoneTrackerWidget data={researchData} />;
      case 'DEADLINES': return <DeadlinesWidget data={deadlines} />;
      case 'ACTION_ITEMS': return <ActionItemsWidget data={researchData} />;
      case 'STATS': return <StatsWidget data={researchData} />;
      case 'CLASS_OVERVIEW': return <ClassOverviewWidget data={classes} />;
      case 'TEST_PERFORMANCE': return <TestPerformanceWidget data={tests} />;
      case 'RECENT_ASSIGNMENTS': return <RecentAssignmentsWidget data={recentAssignments} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('Loading dashboard...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{t('Custom Dashboard')}</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => setShowWidgetLibrary(true)}
                className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
              >
                <Plus size={18} /> {t('Add Widget')}
              </button>
              <button 
                onClick={saveLayout}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} /> {t('Save Layout')}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit3 size={18} /> {t('Edit Layout')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(widget => (
          <div key={widget.id} className="card min-h-[300px] flex flex-col group relative bg-white">
            {isEditing && (
              <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => removeWidget(widget.id)}
                  className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <div className="flex-1 p-4">
              {renderWidget(widget)}
            </div>
          </div>
        ))}
      </div>

      {showWidgetLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('Widget Library')}</h2>
              <button onClick={() => setShowWidgetLibrary(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'STATS', title: t('Research Statistics'), icon: '📊' },
                { type: 'TIMELINE', title: t('Research Timeline'), icon: '🕒' },
                { type: 'MILESTONES', title: t('Milestone Tracker'), icon: '📈' },
                { type: 'DEADLINES', title: t('Upcoming Deadlines'), icon: '📅' },
                { type: 'ACTION_ITEMS', title: t('Recommended Actions'), icon: '💡' },
                { type: 'CLASS_OVERVIEW', title: t('Class Overview'), icon: '🏫' },
                { type: 'TEST_PERFORMANCE', title: t('Test Performance'), icon: '📝' },
                { type: 'RECENT_ASSIGNMENTS', title: t('Recent Assignments'), icon: '📄' }
              ].map(w => (
                <div key={w.type} className="border rounded-lg p-4 flex flex-col gap-3 hover:border-blue-500 transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <h3 className="font-semibold">{w.title}</h3>
                  </div>
                  <button 
                    onClick={() => addWidget(w.type as WidgetType, w.title)}
                    className="btn btn-primary text-sm"
                  >
                    {t('Add to Dashboard')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDashboard;

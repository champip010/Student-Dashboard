export type WidgetType = 'TIMELINE' | 'MILESTONES' | 'DEADLINES' | 'ACTION_ITEMS' | 'STATS';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  settings?: any;
}

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface UserDashboardConfig {
  widgets: WidgetConfig[];
  layout: DashboardLayout[];
}

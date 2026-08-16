export interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export const navigationConfig: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'AI Copilot', path: '/copilot', icon: 'Brain' },
  { name: 'War Room', path: '/war-room', icon: 'ShieldAlert' },
  { name: 'Logs', path: '/history', icon: 'History' },
  { name: 'ROI', path: '/executive', icon: 'TrendingUp' },
];

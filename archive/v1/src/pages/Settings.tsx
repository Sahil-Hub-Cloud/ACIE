import React, { useState } from 'react';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { AppearanceSettings } from '../features/settings/components/AppearanceSettings';
import { NotificationSettings } from '../features/settings/components/NotificationSettings';
import { IntegrationSettings } from '../features/settings/components/IntegrationSettings';
import { AuditCenterPlaceholder } from '../features/settings/placeholders/AuditCenterPlaceholder';
import { WorkspaceMembersPlaceholder } from '../features/workspace/placeholders/WorkspaceMembersPlaceholder';

const SettingsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'alerts' | 'connectors' | 'audit' | 'members'>('console');

  const tabsConfig = [
    { id: 'console', label: 'Console Preferences' },
    { id: 'alerts', label: 'Alerting Config' },
    { id: 'connectors', label: 'Cloud Connectors' },
    { id: 'audit', label: 'Audit Center' },
    { id: 'members', label: 'Workspace Team' },
  ] as const;

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'alerts':
        return <NotificationSettings />;
      case 'connectors':
        return <IntegrationSettings />;
      case 'audit':
        return <AuditCenterPlaceholder />;
      case 'members':
        return <WorkspaceMembersPlaceholder />;
      case 'console':
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Configuration</h2>
        <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
          Manage system preferences, workspaces, and connected webhooks.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="border-b border-slate-900 overflow-x-auto scrollbar-none flex">
        <div className="flex space-x-6 min-w-[580px] pb-px">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-semibold uppercase tracking-wider font-mono border-b-2 transition-all duration-150 ${
                  isActive
                    ? 'border-cyan-500 text-cyan-450 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-350'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Form Container */}
      <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-6 backdrop-blur-md shadow-2xl min-h-[300px]">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  return (
    <ErrorBoundary variant="app">
      <SettingsContent />
    </ErrorBoundary>
  );
};

export default Settings;

'use client';

import React from 'react';
import { OrganizationPermissions } from '@/config/database.types';

interface FeaturesTabProps {
  permissions: OrganizationPermissions;
  onUpdate: (updates: Partial<OrganizationPermissions>) => void;
  isUpdating: boolean;
}

const FEATURE_LABELS: Record<keyof OrganizationPermissions['features'], string> = {
  advanced_analytics: 'Advanced Analytics',
  multi_location: 'Multi-Location Support',
  api_access: 'API Access',
  custom_reports: 'Custom Reports',
  bulk_operations: 'Bulk Operations',
};

const FEATURE_DESCRIPTIONS: Record<keyof OrganizationPermissions['features'], string> = {
  advanced_analytics: 'Enable advanced analytics and data visualization features',
  multi_location: 'Support for managing multiple store locations',
  api_access: 'Allow access to REST API endpoints for integrations',
  custom_reports: 'Create and customize reports beyond standard templates',
  bulk_operations: 'Perform bulk operations on inventory, users, and other data',
};

const FEATURE_IMPACTS: Record<keyof OrganizationPermissions['features'], string[]> = {
  advanced_analytics: [
    'Unlocks advanced dashboard widgets',
    'Enables predictive analytics',
    'Provides detailed performance metrics',
  ],
  multi_location: [
    'Adds location-based inventory tracking',
    'Enables location-specific reporting',
    'Supports location-based user permissions',
  ],
  api_access: [
    'Enables third-party integrations',
    'Allows custom application development',
    'Provides programmatic data access',
  ],
  custom_reports: [
    'Unlocks report builder interface',
    'Enables custom data exports',
    'Provides advanced filtering options',
  ],
  bulk_operations: [
    'Enables batch inventory updates',
    'Allows bulk user management',
    'Supports mass data imports/exports',
  ],
};

export default function FeaturesTab({ permissions, onUpdate, isUpdating }: FeaturesTabProps) {
  const updateFeature = (feature: keyof OrganizationPermissions['features'], enabled: boolean) => {
    const updatedFeatures = {
      ...permissions.features,
      [feature]: enabled,
    };
    onUpdate({ features: updatedFeatures });
  };

  const enableAllFeatures = () => {
    const allEnabled = Object.keys(permissions.features).reduce(
      (acc, feature) => ({ ...acc, [feature]: true }),
      {} as OrganizationPermissions['features']
    );
    onUpdate({ features: allEnabled });
  };

  const disableAllFeatures = () => {
    const allDisabled = Object.keys(permissions.features).reduce(
      (acc, feature) => ({ ...acc, [feature]: false }),
      {} as OrganizationPermissions['features']
    );
    onUpdate({ features: allDisabled });
  };

  const enabledCount = Object.values(permissions.features).filter(Boolean).length;
  const totalCount = Object.keys(permissions.features).length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Organization Features</h3>
            <p className="text-white/70 text-sm">
              Enable or disable advanced features for your organization.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70 mb-2">
              {enabledCount} of {totalCount} features enabled
            </div>
            <div className="flex space-x-2">
              <button
                onClick={enableAllFeatures}
                disabled={isUpdating || enabledCount === totalCount}
                className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={disableAllFeatures}
                disabled={isUpdating || enabledCount === 0}
                className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Disable All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(permissions.features).map(([featureName, enabled]) => {
          const feature = featureName as keyof OrganizationPermissions['features'];
          const impacts = FEATURE_IMPACTS[feature] || [];

          return (
            <div
              key={feature}
              className={`bg-white/5 border rounded-lg p-6 transition-all ${
                enabled ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateFeature(feature, e.target.checked)}
                        disabled={isUpdating}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <h4 className="text-lg font-medium text-white">
                        {FEATURE_LABELS[feature]}
                      </h4>
                    </label>
                    <span className={`text-xs px-2 py-1 rounded ${
                      enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    {FEATURE_DESCRIPTIONS[feature]}
                  </p>
                </div>
              </div>

              {impacts.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <h5 className="text-sm font-medium text-white/80 mb-2">What this enables:</h5>
                  <ul className="space-y-1">
                    {impacts.map((impact, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-white/60">
                        <span className="w-1 h-1 bg-white/40 rounded-full" />
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {enabled && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-blue-400">
                      This feature is active and available to users based on their role permissions.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Dependencies Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-1">Feature Dependencies</h4>
            <p className="text-xs text-yellow-400/80">
              Some features may depend on others to function properly. Disabling certain features may affect related functionality.
              Changes take effect immediately and will be reflected in user interfaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
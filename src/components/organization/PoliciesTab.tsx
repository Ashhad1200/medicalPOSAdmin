'use client';

import React, { useState } from 'react';
import { OrganizationPermissions } from '@/config/database.types';

interface PoliciesTabProps {
  permissions: OrganizationPermissions;
  onUpdate: (updates: Partial<OrganizationPermissions>) => void;
  isUpdating: boolean;
}

export default function PoliciesTab({ permissions, onUpdate, isUpdating }: PoliciesTabProps) {
  const [newIpRestriction, setNewIpRestriction] = useState('');
  const [newTimeRestriction, setNewTimeRestriction] = useState({
    start_time: '',
    end_time: '',
    days_of_week: [] as number[],
    timezone: 'UTC',
  });

  const updatePolicy = (key: keyof OrganizationPermissions['policies'], value: any) => {
    const updatedPolicies = {
      ...permissions.policies,
      [key]: value,
    };
    onUpdate({ policies: updatedPolicies });
  };

  const addIpRestriction = () => {
    if (!newIpRestriction.trim()) return;
    
    const currentRestrictions = permissions.policies.ip_restrictions || [];
    const updatedRestrictions = [...currentRestrictions, newIpRestriction.trim()];
    updatePolicy('ip_restrictions', updatedRestrictions);
    setNewIpRestriction('');
  };

  const removeIpRestriction = (index: number) => {
    const currentRestrictions = permissions.policies.ip_restrictions || [];
    const updatedRestrictions = currentRestrictions.filter((_, i) => i !== index);
    updatePolicy('ip_restrictions', updatedRestrictions);
  };

  const addTimeRestriction = () => {
    if (!newTimeRestriction.start_time || !newTimeRestriction.end_time || newTimeRestriction.days_of_week.length === 0) {
      return;
    }

    const currentRestrictions = permissions.policies.time_restrictions || [];
    const updatedRestrictions = [...currentRestrictions, newTimeRestriction];
    updatePolicy('time_restrictions', updatedRestrictions);
    setNewTimeRestriction({
      start_time: '',
      end_time: '',
      days_of_week: [],
      timezone: 'UTC',
    });
  };

  const removeTimeRestriction = (index: number) => {
    const currentRestrictions = permissions.policies.time_restrictions || [];
    const updatedRestrictions = currentRestrictions.filter((_, i) => i !== index);
    updatePolicy('time_restrictions', updatedRestrictions);
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = newTimeRestriction.days_of_week;
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    setNewTimeRestriction(prev => ({
      ...prev,
      days_of_week: updatedDays,
    }));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTimeRestriction = (restriction: any) => {
    const days = restriction.days_of_week.map((day: number) => dayNames[day]).join(', ');
    return `${restriction.start_time} - ${restriction.end_time} (${days})`;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Access Policies</h3>
        <p className="text-white/70 text-sm">
          Configure security policies and access restrictions for your organization.
        </p>
      </div>

      {/* Session Management */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Session Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={permissions.policies.session_timeout}
              onChange={(e) => updatePolicy('session_timeout', parseInt(e.target.value) || 30)}
              disabled={isUpdating}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-white/60 mt-1">
              Users will be automatically logged out after this period of inactivity.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Max Concurrent Sessions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={permissions.policies.max_concurrent_sessions}
              onChange={(e) => updatePolicy('max_concurrent_sessions', parseInt(e.target.value) || 1)}
              disabled={isUpdating}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-white/60 mt-1">
              Maximum number of simultaneous sessions per user.
            </p>
          </div>
        </div>
      </div>

      {/* IP Restrictions */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">IP Address Restrictions</h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter IP address or CIDR block (e.g., 192.168.1.0/24)"
              value={newIpRestriction}
              onChange={(e) => setNewIpRestriction(e.target.value)}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={addIpRestriction}
              disabled={isUpdating || !newIpRestriction.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {permissions.policies.ip_restrictions?.map((ip, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
              <span className="text-white/80 font-mono text-sm">{ip}</span>
              <button
                onClick={() => removeIpRestriction(index)}
                disabled={isUpdating}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )) || (
            <p className="text-white/60 text-sm italic">No IP restrictions configured. Access allowed from any IP address.</p>
          )}
        </div>
      </div>

      {/* Time Restrictions */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Time-based Access Restrictions</h4>
        
        <div className="mb-6 p-4 bg-white/5 rounded border border-white/10">
          <h5 className="text-sm font-medium text-white/80 mb-3">Add New Time Restriction</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Start Time</label>
              <input
                type="time"
                value={newTimeRestriction.start_time}
                onChange={(e) => setNewTimeRestriction(prev => ({ ...prev, start_time: e.target.value }))}
                disabled={isUpdating}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">End Time</label>
              <input
                type="time"
                value={newTimeRestriction.end_time}
                onChange={(e) => setNewTimeRestriction(prev => ({ ...prev, end_time: e.target.value }))}
                disabled={isUpdating}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white/70 mb-2">Days of Week</label>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleDayOfWeek(index)}
                  disabled={isUpdating}
                  className={`px-3 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    newTimeRestriction.days_of_week.includes(index)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addTimeRestriction}
            disabled={isUpdating || !newTimeRestriction.start_time || !newTimeRestriction.end_time || newTimeRestriction.days_of_week.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Time Restriction
          </button>
        </div>

        <div className="space-y-2">
          {permissions.policies.time_restrictions?.map((restriction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
              <span className="text-white/80 text-sm">{formatTimeRestriction(restriction)}</span>
              <button
                onClick={() => removeTimeRestriction(index)}
                disabled={isUpdating}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )) || (
            <p className="text-white/60 text-sm italic">No time restrictions configured. Access allowed 24/7.</p>
          )}
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Data Retention Policy</h4>
        
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Data Retention Period (days)
          </label>
          <input
            type="number"
            min="30"
            max="2555"
            value={permissions.policies.data_retention_days}
            onChange={(e) => updatePolicy('data_retention_days', parseInt(e.target.value) || 365)}
            disabled={isUpdating}
            className="w-full max-w-xs px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="text-xs text-white/60 mt-1">
            How long to retain user activity logs and audit trails. Minimum 30 days, maximum 7 years.
          </p>
        </div>
      </div>

      {/* Policy Summary */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">Policy Impact</h4>
            <p className="text-xs text-blue-400/80">
              These policies apply to all users in your organization. Changes take effect immediately for new sessions.
              Existing sessions will be affected based on the session timeout setting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { 
  FlaskConical, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  Building2
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: UserProfile;
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingReviewCount: number;
  activeSessionCount: number;
  tamperCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  currentTab,
  onTabChange,
  pendingReviewCount,
  activeSessionCount,
  tamperCount,
}) => {
  const roles: { id: UserRole; label: string; name: string; title: string; color: string }[] = [
    {
      id: 'student',
      label: 'Student',
      name: 'Alice Chen',
      title: 'Ph.D. Candidate (Biophysics)',
      color: 'border-emerald-500 text-emerald-400',
    },
    {
      id: 'owner',
      label: 'Lab Owner',
      name: 'Dr. Sharma',
      title: 'PI & Structural Biology Custodian',
      color: 'border-blue-500 text-blue-400',
    },
    {
      id: 'manager',
      label: 'Manager',
      name: 'Rahul Verma',
      title: 'Core Facility Director & EHS',
      color: 'border-amber-500 text-amber-400',
    },
    {
      id: 'admin',
      label: 'Admin',
      name: 'Compliance Office',
      title: 'Security & Audit Officer',
      color: 'border-purple-500 text-purple-400',
    },
  ];

  const tabs = [
    {
      id: 'discovery',
      label: 'Resource Discovery',
      icon: FlaskConical,
      badge: null,
    },
    {
      id: 'review',
      label: 'Manager Review Queue',
      icon: ClipboardList,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'checkin',
      label: 'Check-In & Return',
      icon: CheckCircle2,
      badge: activeSessionCount > 0 ? activeSessionCount : null,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'incidents',
      label: 'Incidents & Assistant',
      icon: AlertTriangle,
      badge: null,
    },
    {
      id: 'audit',
      label: 'SHA-256 Audit Ledger',
      icon: ShieldCheck,
      badge: tamperCount > 0 ? 'ALERT' : 'SECURE',
      badgeColor: tamperCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300',
    },
    {
      id: 'owner',
      label: 'Lab Oversight',
      icon: Building2,
      badge: null,
      roleRequired: 'owner',
    },
    {
      id: 'admin',
      label: 'Admin Registry',
      icon: Layers,
      badge: null,
      roleRequired: 'admin',
    },
  ];

  // Remaining quota calculation
  const remainingQuota = Math.max(0, currentUser.weeklyQuotaHours - currentUser.usedWeeklyHours);
  const quotaPercent = Math.min(100, Math.round((currentUser.usedWeeklyHours / currentUser.weeklyQuotaHours) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Primary Brand & Role Switcher Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shadow-inner text-white font-black text-xl tracking-tight">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">BenchShare</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                InstCore v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400">Institutional Resource-Sharing & Cryptographic Audit Platform</p>
          </div>
        </div>

        {/* Quota widget for student */}
        {currentRole === 'student' && (
          <div className="hidden md:flex items-center gap-3 bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>Weekly Quota:</span>
                <span className="font-semibold text-white">
                  {currentUser.usedWeeklyHours.toFixed(1)} / {currentUser.weeklyQuotaHours.toFixed(1)} hrs
                </span>
              </div>
              <div className="w-36 bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotaPercent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
            <span className="text-emerald-400 font-semibold">{remainingQuota.toFixed(1)}h left</span>
          </div>
        )}

        {/* Mandatory Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2 hidden sm:inline">Role:</span>
          <div className="flex items-center gap-1">
            {roles.map((r) => {
              const isSelected = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  title={`Switch to ${r.label} (${r.name}) - ${r.title}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-500'}`} />
                  <span>{r.label}</span>
                  <span className="text-[10px] opacity-75 font-normal hidden lg:inline">
                    ({r.name.split(' ')[0]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Persona Context Sub-bar */}
      <div className="bg-slate-950/50 border-t border-slate-800/80 px-4 sm:px-6 py-1.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Persona:</span>
            <span className="font-semibold text-white">{currentUser.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{currentUser.title}</span>
            <span className="text-slate-600">·</span>
            <span className="text-teal-400">{currentUser.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Badges:</span>
            <div className="flex items-center gap-1">
              {currentUser.trainingBadges.slice(0, 3).map((badge) => (
                <span
                  key={badge}
                  className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded text-[10px] font-mono"
                >
                  {badge}
                </span>
              ))}
              {currentUser.trainingBadges.length > 3 && (
                <span className="text-[10px] text-slate-500">
                  +{currentUser.trainingBadges.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-teal-400 text-teal-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    tab.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

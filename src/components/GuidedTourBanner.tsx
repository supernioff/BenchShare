import React from 'react';
import { 
  Compass, 
  CalendarClock, 
  ClipboardCheck, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Award,
  Play,
  RotateCcw
} from 'lucide-react';
import { UserRole } from '../types';

interface GuidedTourBannerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onResetDemo: () => void;
}

export const GuidedTourBanner: React.FC<GuidedTourBannerProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  onResetDemo,
}) => {
  const steps = [
    {
      id: 'step-1',
      title: '1. Discovery & Eligibility',
      tab: 'discovery',
      role: 'student' as UserRole,
      icon: Compass,
      desc: 'Browse equipment & check badge eligibility',
    },
    {
      id: 'step-2',
      title: '2. Rolling Quota Booking',
      tab: 'discovery',
      role: 'student' as UserRole,
      icon: CalendarClock,
      desc: 'Calculate weekly quota & submit booking',
    },
    {
      id: 'step-3',
      title: '3. Manager Review Queue',
      tab: 'review',
      role: 'manager' as UserRole,
      icon: ClipboardCheck,
      desc: 'Rahul logs mandatory plain-language decisions',
    },
    {
      id: 'step-4',
      title: '4. Check-in & Return Simulator',
      tab: 'checkin',
      role: 'student' as UserRole,
      icon: Camera,
      desc: 'Photo verification & safety checklist',
    },
    {
      id: 'step-5',
      title: '5. AI Incident Summariser',
      tab: 'incidents',
      role: 'student' as UserRole,
      icon: Sparkles,
      desc: 'Draft EHS analysis & CAPA with Gemini AI',
    },
    {
      id: 'step-6',
      title: '6. SHA-256 Audit Log',
      tab: 'audit',
      role: 'admin' as UserRole,
      icon: ShieldCheck,
      desc: 'Tamper-evident ledger & chain verification',
    },
    {
      id: 'step-7',
      title: '7. Lab Owner Controls',
      tab: 'owner',
      role: 'owner' as UserRole,
      icon: Sliders,
      desc: 'Dr. Sharma sets maintenance & rates',
    },
    {
      id: 'step-8',
      title: '8. Admin Badge Registry',
      tab: 'admin',
      role: 'admin' as UserRole,
      icon: Award,
      desc: 'Grant badges & configure quota policies',
    },
  ];

  return (
    <section aria-label="End-to-End Workflow Navigator" className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Workflow Tour
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any step to switch role & navigate instantly:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-thin">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentTab === step.tab && currentRole === step.role;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentRole(step.role);
                  setCurrentTab(step.tab);
                }}
                title={`${step.title} (${step.desc})`}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 border-teal-400 font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-750 hover:text-white hover:border-slate-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{step.title}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />

          <button
            onClick={onResetDemo}
            title="Reset simulation data to initial demo state"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/50 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </section>
  );
};

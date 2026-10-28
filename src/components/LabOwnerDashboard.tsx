import React, { useState } from 'react';
import { 
  Building2, 
  Settings, 
  Calendar, 
  DollarSign, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Save, 
  Sliders,
  Camera,
  Activity
} from 'lucide-react';
import { Equipment, UserProfile, UserRole } from '../types';
import { TRAINING_BADGES } from '../data/mockData';

interface LabOwnerDashboardProps {
  equipmentList: Equipment[];
  onUpdateEquipment: (updated: Equipment, auditReason: string) => void;
  currentUser: UserProfile;
  currentRole: UserRole;
  onSwitchToOwner: () => void;
}

export const LabOwnerDashboard: React.FC<LabOwnerDashboardProps> = ({
  equipmentList,
  onUpdateEquipment,
  currentUser,
  currentRole,
  onSwitchToOwner,
}) => {
  // Dr. Sharma's instruments or all instruments
  const [selectedEqId, setSelectedEqId] = useState<string>(equipmentList[0]?.id || 'eq-1');
  const selectedEq = equipmentList.find((e) => e.id === selectedEqId) || equipmentList[0];

  const [hourlyRate, setHourlyRate] = useState<number>(selectedEq.hourlyRate);
  const [status, setStatus] = useState<string>(selectedEq.status);
  const [isBlackedOut, setIsBlackedOut] = useState<boolean>(selectedEq.isBlackedOut || false);
  const [blackoutReason, setBlackoutReason] = useState<string>(
    selectedEq.blackoutReason || 'Scheduled probe calibration and helium transfer.'
  );
  const [selectedBadges, setSelectedBadges] = useState<string[]>(selectedEq.requiredBadges);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When selected equipment changes, update local state
  const handleSelectEquipment = (eq: Equipment) => {
    setSelectedEqId(eq.id);
    setHourlyRate(eq.hourlyRate);
    setStatus(eq.status);
    setIsBlackedOut(eq.isBlackedOut || false);
    setBlackoutReason(eq.blackoutReason || 'Preventative maintenance window.');
    setSelectedBadges(eq.requiredBadges);
    setSaveSuccess(false);
  };

  const handleToggleBadge = (badgeCode: string) => {
    if (selectedBadges.includes(badgeCode)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badgeCode));
    } else {
      setSelectedBadges([...selectedBadges, badgeCode]);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Equipment = {
      ...selectedEq,
      hourlyRate: Number(hourlyRate),
      status: isBlackedOut ? 'maintenance' : (status as any),
      isBlackedOut,
      blackoutReason: isBlackedOut ? blackoutReason : undefined,
      requiredBadges: selectedBadges,
    };

    onUpdateEquipment(
      updated,
      `Dr. Sharma updated configuration for ${selectedEq.name}: Rate $${hourlyRate}/hr, Status ${updated.status}, Prerequisites [${selectedBadges.join(', ')}]`
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Step 7: Lab Owner & Custodian Controls
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Principal Investigator View</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Laboratory Oversight: Dr. Vikram Sharma</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Lab custodians manage instrument availability, set maintenance blackout periods, adjust institutional chargeback rates,
            and enforce prerequisite training credentials.
          </p>
        </div>

        {currentRole !== 'owner' && (
          <div className="bg-blue-950/70 border border-blue-800 rounded-lg p-3 text-xs flex items-center gap-3">
            <span className="text-blue-200">Currently viewing as {currentRole}. Switch to Lab Owner?</span>
            <button
              onClick={onSwitchToOwner}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors shrink-0"
            >
              Switch to Dr. Sharma
            </button>
          </div>
        )}
      </div>

      {/* Equipment Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {equipmentList.map((eq) => {
          const isSelected = eq.id === selectedEq.id;
          return (
            <div
              key={eq.id}
              onClick={() => handleSelectEquipment(eq)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-850 border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start text-xs mb-1.5">
                <span className="font-mono text-slate-400 text-[10px]">{eq.category}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                  eq.status === 'available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  eq.status === 'in_use' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                  'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {eq.status.toUpperCase()}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{eq.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{eq.location}</p>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 mt-2 border-t border-slate-800">
                <span>Rate: <strong className="text-white">${eq.hourlyRate}/h</strong></span>
                <span>{eq.requiredBadges.length} Badges Req.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custodian Instrument Management Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Custodian Configuration
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{selectedEq.name}</h2>
            <p className="text-xs text-slate-400">{selectedEq.model} · Location: {selectedEq.location}</p>
          </div>

          {saveSuccess && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved & Appended to SHA-256 Ledger!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Operational Status & Maintenance Blackout */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>Operational State & Blackouts</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Base Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="available">Available for Student Reservations</option>
                  <option value="in_use">In Active Experimental Run</option>
                  <option value="maintenance">Under Maintenance / Service</option>
                </select>
              </div>

              {/* Maintenance Blackout Toggle */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isBlackedOut}
                    onChange={(e) => setIsBlackedOut(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white">Enable Custodian Maintenance Blackout</span>
                    <span className="block text-[11px] text-slate-400">
                      Locks calendar from all student reservations and flags equipment in discovery catalog.
                    </span>
                  </div>
                </label>

                {isBlackedOut && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Blackout Reason & Service Schedule</label>
                    <textarea
                      rows={2}
                      value={blackoutReason}
                      onChange={(e) => setBlackoutReason(e.target.value)}
                      placeholder="e.g. Scheduled cryogen transfer and high-vacuum bakeout by Bruker field engineer..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Hourly Chargeback Rate */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs text-slate-400 mb-1 font-medium">Hourly Chargeback Rate (USD)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Applies to NIH/NSF grant accounts. Off-peak discount applies automatically (50%).
                </span>
              </div>
            </div>

            {/* Right: Prerequisite Training Credentials Enforced */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>Mandatory Training Prerequisites</span>
              </h3>
              <p className="text-xs text-slate-400">
                Students without ALL selected badges will see an amber "Not Eligible" badge in Step 1 and cannot reserve this bench.
              </p>

              <div className="space-y-2">
                {TRAINING_BADGES.map((b) => {
                  const isChecked = selectedBadges.includes(b.code);
                  return (
                    <label
                      key={b.code}
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-teal-950/40 border-teal-800 text-teal-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBadge(b.code)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-semibold text-white">{b.name} ({b.code})</div>
                        <div className="text-[11px] text-slate-400">{b.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Apply Changes & Log to SHA-256 Chain</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

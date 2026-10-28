import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  UserCheck, 
  Users, 
  Settings, 
  Clock, 
  Layers, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { UserProfile, AuditBlock, UserRole } from '../types';
import { TRAINING_BADGES } from '../data/mockData';

interface AdminDashboardProps {
  users: Record<string, UserProfile>;
  onToggleUserBadge: (userId: string, badgeCode: string) => void;
  auditChain: AuditBlock[];
  weeklyQuotaLimit: number;
  onUpdateWeeklyQuotaLimit: (limit: number) => void;
  currentRole: UserRole;
  onSwitchToAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  onToggleUserBadge,
  auditChain,
  weeklyQuotaLimit,
  onUpdateWeeklyQuotaLimit,
  currentRole,
  onSwitchToAdmin,
}) => {
  const [quotaInput, setQuotaInput] = useState<number>(weeklyQuotaLimit);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [quotaSaved, setQuotaSaved] = useState(false);

  const handleSaveQuota = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeeklyQuotaLimit(Number(quotaInput));
    setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditChain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `benchshare_cryptographic_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyManifest = () => {
    const manifest = auditChain.map((b) => ({
      index: b.index,
      timestamp: b.timestamp,
      action: b.action,
      actor: b.actor,
      prevHash: b.prevHash,
      hash: b.hash,
    }));
    navigator.clipboard?.writeText(JSON.stringify(manifest, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const studentUser = users['student'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Step 8: Admin & Compliance Registry
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Institutional System Administration</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Institutional Governance, Badges & Ledger Export</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Admin controls allow verifying and granting institutional safety credentials, setting campus-wide rolling quota thresholds,
            and exporting cryptographic ledger audit manifests for institutional compliance.
          </p>
        </div>

        {currentRole !== 'admin' && (
          <div className="bg-purple-950/70 border border-purple-800 rounded-lg p-3 text-xs flex items-center gap-3">
            <span className="text-purple-200">Viewing as {currentRole}. Switch to Admin view?</span>
            <button
              onClick={onSwitchToAdmin}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors shrink-0"
            >
              Switch to Admin
            </button>
          </div>
        )}
      </div>

      {/* Two Column Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Training Badges Registry */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Central Safety Training Registry</h3>
                <p className="text-xs text-slate-400">
                  Grant or revoke Alice Chen's certifications. Updates reflect dynamically in Resource Discovery eligibility!
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              User: Alice Chen ({studentUser.email})
            </span>
          </div>

          {/* Badges List with Live Toggle Switches */}
          <div className="space-y-3">
            {TRAINING_BADGES.map((b) => {
              const hasBadge = studentUser.trainingBadges.includes(b.code);
              return (
                <div
                  key={b.code}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    hasBadge
                      ? 'bg-slate-950/90 border-teal-800/80 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {b.code}
                      </span>
                      <span className="font-bold text-white text-xs">{b.name}</span>
                      <span className="text-[10px] text-slate-500">· {b.level}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{b.description}</p>
                    <div className="text-[10px] text-slate-500">
                      Authority: <strong className="text-slate-400">{b.issuingAuthority}</strong> · Valid Until: {b.validUntil}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleUserBadge(studentUser.id, b.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                      hasBadge
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                    }`}
                  >
                    {hasBadge ? '✓ Certified (Revoke)' : '+ Grant Credential'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quota Policy & Master Ledger Export */}
        <div className="space-y-6">
          {/* Institutional Quota Policy Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campus Quota Policy</h3>
            </div>

            <form onSubmit={handleSaveQuota} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Standard Rolling Weekly Cap (Hours)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="1"
                  value={quotaInput}
                  onChange={(e) => setQuotaInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <div>• Off-Peak Hours Discount: <strong>50% (0.5x multiplier)</strong></div>
                <div>• Quota Cycle: <strong>Rolling 7-Day Window</strong></div>
                <div>• Emergency Variance: <strong>Requires PI Signoff</strong></div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {quotaSaved ? <span>✓ Quota Policy Applied!</span> : <span>Update Weekly Cap Policy</span>}
              </button>
            </form>
          </div>

          {/* Cryptographic Ledger Export */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cryptographic Ledger Export</h3>
            </div>

            <p className="text-xs text-slate-400">
              Export the complete tamper-evident audit log with all chained SHA-256 blocks for independent third-party verification.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExportJSON}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Download Ledger JSON ({auditChain.length} Blocks)</span>
              </button>

              <button
                onClick={handleCopyManifest}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {copiedManifest ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Manifest to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Hash Chain Manifest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  FileCheck,
  Send
} from 'lucide-react';
import { Equipment, UserProfile, BookingRequest } from '../types';

interface BookingModalProps {
  equipment: Equipment;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (booking: BookingRequest) => void;
  onNavigateToReviewQueue: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  currentUser,
  isOpen,
  onClose,
  onSubmitBooking,
  onNavigateToReviewQueue,
}) => {
  if (!isOpen) return null;

  // Form states
  const [date, setDate] = useState('2026-10-30');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isPeak, setIsPeak] = useState(true);
  const [projectCode, setProjectCode] = useState(currentUser.grantCodes[0] || 'NIH-R01-GM-14820');
  const [supervisorEndorsement, setSupervisorEndorsement] = useState(true);
  const [safetyAffirmed, setSafetyAffirmed] = useState(true);
  const [purpose, setPurpose] = useState(
    `Quantitative analytical run on ${equipment.name} for thesis aim 2.3: structural characterization under physiological buffer conditions.`
  );
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Time calculations
  const calculateDurationHours = (): number => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
      return Math.max(0.5, Number((diffMinutes / 60).toFixed(1)));
    } catch {
      return 3.0;
    }
  };

  const durationHours = calculateDurationHours();
  const effectiveQuotaHours = isPeak ? durationHours : durationHours * 0.5;
  const projectedTotalUsed = currentUser.usedWeeklyHours + effectiveQuotaHours;
  const remainingAllowance = currentUser.weeklyQuotaHours - projectedTotalUsed;
  const isOverQuota = projectedTotalUsed > currentUser.weeklyQuotaHours;
  const totalCost = (durationHours * equipment.hourlyRate).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyAffirmed) return;

    const newBooking: BookingRequest = {
      id: `bk-${Date.now().toString().slice(-5)}`,
      resourceId: equipment.id,
      resourceName: equipment.name,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      requesterEmail: currentUser.email,
      projectCode,
      date,
      startTime,
      endTime,
      hours: durationHours,
      isPeak,
      effectiveQuotaHours,
      supervisorEndorsement,
      purpose,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    onSubmitBooking(newBooking);
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Step 2: Resource Reservation</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Rolling Weekly Quota</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{equipment.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Booking Request Dispatched & Cryptographically Logged!</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                Your reservation for <strong className="text-slate-200">{equipment.name}</strong> has entered Manager Rahul Verma's Review Queue and appended an immutable SHA-256 block to the Institutional Audit Chain.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Effective Quota Deduction:</span>
                <span className="font-semibold text-emerald-400">-{effectiveQuotaHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Project Charge Code:</span>
                <span className="font-mono text-slate-200">{projectCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Review Status:</span>
                <span className="font-semibold text-amber-400 uppercase">Pending Manager Approval</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToReviewQueue();
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Switch to Rahul & Review in Queue</span>
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Rolling Quota Visualizer Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Student Rolling Weekly Quota Simulator</span>
                </div>
                <span className="text-slate-400">
                  Cap: <strong className="text-white">{currentUser.weeklyQuotaHours.toFixed(1)} hrs/week</strong>
                </span>
              </div>

              {/* Multi-segment Quota Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Currently Used: {currentUser.usedWeeklyHours.toFixed(1)}h</span>
                  <span className={isOverQuota ? 'text-rose-400 font-bold' : 'text-teal-400'}>
                    + {effectiveQuotaHours.toFixed(1)}h this booking = {projectedTotalUsed.toFixed(1)}h
                  </span>
                  <span>
                    {remainingAllowance >= 0 
                      ? `${remainingAllowance.toFixed(1)}h remaining` 
                      : `Exceeds by ${Math.abs(remainingAllowance).toFixed(1)}h!`}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  {/* Prior used */}
                  <div
                    className="bg-slate-600 h-full transition-all"
                    style={{ width: `${Math.min(100, (currentUser.usedWeeklyHours / currentUser.weeklyQuotaHours) * 100)}%` }}
                    title={`Already used: ${currentUser.usedWeeklyHours}h`}
                  />
                  {/* Current booking delta */}
                  <div
                    className={`${isOverQuota ? 'bg-rose-500' : 'bg-teal-400'} h-full transition-all`}
                    style={{ width: `${Math.min(100 - (currentUser.usedWeeklyHours / currentUser.weeklyQuotaHours) * 100, (effectiveQuotaHours / currentUser.weeklyQuotaHours) * 100)}%` }}
                    title={`New booking request: ${effectiveQuotaHours}h`}
                  />
                </div>
              </div>

              {/* Peak vs Off-Peak Incentive Toggle */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-md p-2.5 text-xs">
                <div>
                  <div className="font-semibold text-white">Rate Tier: {isPeak ? 'Standard Peak Hours' : 'Off-Peak Discount (50% Quota Saver)'}</div>
                  <div className="text-[11px] text-slate-400">
                    {isPeak 
                      ? 'Peak (09:00 - 17:00): 100% quota rate (1 hour used = 1 hour deducted).'
                      : 'Off-Peak (Nights/Weekends): 50% discount incentive (1 hour used = 0.5 hours deducted).'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPeak(!isPeak)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all border ${
                    !isPeak
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {isPeak ? 'Switch to Off-Peak' : 'Switch to Peak'}
                </button>
              </div>

              {isOverQuota && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-md text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Warning: This request exceeds your rolling weekly 20.0h quota. Manager Rahul will require mandatory emergency rationale to approve.
                  </span>
                </div>
              )}
            </div>

            {/* Date and Time Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reservation Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>

            {/* Project / Grant Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Institutional Grant / Project Code</label>
                <select
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  {currentUser.grantCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                  <option value="DEPARTMENT-CORE-ALLOWANCE">DEPARTMENT-CORE-ALLOWANCE (Dean's Fund)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Chargeback</label>
                <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs flex justify-between items-center text-slate-300">
                  <span>${equipment.hourlyRate}/hr × {durationHours}h:</span>
                  <span className="font-bold text-white text-sm">${totalCost}</span>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Research Purpose & Sample Chemistry</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
                placeholder="Describe experimental protocol and samples being measured..."
                required
              />
            </div>

            {/* Mandatory Affirmations */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={supervisorEndorsement}
                  onChange={(e) => setSupervisorEndorsement(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-0"
                />
                <span>
                  PI Endorsement: Principal Investigator has signed off on sample protocol and grant billing.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={safetyAffirmed}
                  onChange={(e) => setSafetyAffirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-0"
                  required
                />
                <span>
                  Safety Affirmation: I hold active credentials ({equipment.requiredBadges.join(', ')}) and agree to complete the Pre-Use Check-In and Post-Use Photo Return protocols.
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Submit to Review Queue</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

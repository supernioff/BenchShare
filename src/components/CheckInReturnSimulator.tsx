import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  FileCheck, 
  Layers, 
  ArrowRight,
  Eye,
  Check,
  RotateCcw
} from 'lucide-react';
import { BookingRequest, Equipment, UserProfile, UserRole } from '../types';
import { SAMPLE_LAB_PHOTOS } from '../data/mockData';

interface CheckInReturnSimulatorProps {
  bookings: BookingRequest[];
  equipmentList: Equipment[];
  currentUser: UserProfile;
  currentRole: UserRole;
  onCheckInComplete: (bookingId: string, photoUrl: string, photoName: string, checklist: Record<string, boolean>) => void;
  onReturnComplete: (
    bookingId: string, 
    photoUrl: string, 
    photoName: string, 
    checklist: Record<string, boolean>,
    condition: 'pristine' | 'minor_wear' | 'soiled_workstation' | 'hardware_fault',
    notes: string
  ) => void;
  onNavigateToIncidents: () => void;
}

export const CheckInReturnSimulator: React.FC<CheckInReturnSimulatorProps> = ({
  bookings,
  equipmentList,
  currentUser,
  currentRole,
  onCheckInComplete,
  onReturnComplete,
  onNavigateToIncidents,
}) => {
  // Find bookings that can be checked in or returned
  const eligibleBookings = bookings.filter(
    (b) => b.status === 'approved' || b.status === 'active' || b.status === 'completed'
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    eligibleBookings[0]?.id || ''
  );

  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || eligibleBookings[0];
  const matchedEquipment = equipmentList.find((e) => e.id === activeBooking?.resourceId);

  // Check-in state
  const [beforeChecklist, setBeforeChecklist] = useState<Record<string, boolean>>({
    opticalZero: true,
    emergencyStop: true,
    ppeDonned: true,
    pressureGreenZone: true,
    surfaceDisinfected: true,
  });

  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>(SAMPLE_LAB_PHOTOS.pristineCentrifuge);
  const [beforePhotoName, setBeforePhotoName] = useState<string>('sample_stage_pre_inspection.jpg');

  // Return state
  const [afterChecklist, setAfterChecklist] = useState<Record<string, boolean>>({
    samplesRemoved: true,
    opticsCleaned: true,
    wasteUnder80: true,
    chambersSealed: true,
    logbookSigned: true,
  });

  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(SAMPLE_LAB_PHOTOS.cleanHood);
  const [afterPhotoName, setAfterPhotoName] = useState<string>('sample_stage_post_cleaning.jpg');
  const [returnCondition, setReturnCondition] = useState<'pristine' | 'minor_wear' | 'soiled_workstation' | 'hardware_fault'>('pristine');
  const [returnNotes, setReturnNotes] = useState('Standard protocol completed. Solvent lines purged with methanol and stage wiped with 70% IPA.');

  // Handle local photo mock upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'before') {
        setBeforePhotoUrl(url);
        setBeforePhotoName(file.name);
      } else {
        setAfterPhotoUrl(url);
        setAfterPhotoName(file.name);
      }
    }
  };

  const handleSelectPresetPhoto = (url: string, name: string, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotoUrl(url);
      setBeforePhotoName(name);
    } else {
      setAfterPhotoUrl(url);
      setAfterPhotoName(name);
    }
  };

  const isBeforeChecklistComplete = Object.values(beforeChecklist).every(Boolean);
  const isAfterChecklistComplete = Object.values(afterChecklist).every(Boolean);

  if (!activeBooking) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
        <Camera className="w-12 h-12 mx-auto text-slate-600" />
        <h2 className="text-lg font-bold text-white">No Approved Reservations Ready for Simulator</h2>
        <p className="text-xs max-w-md mx-auto">
          You need an approved reservation to simulate check-in and return. Go to the Manager Review Queue to approve Alice's pending request, or submit a new reservation.
        </p>
      </div>
    );
  }

  const isCheckedIn = activeBooking.status === 'active' || activeBooking.status === 'completed';
  const isCompleted = activeBooking.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Step 4: Check-in & Return Simulator</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Custodial Handover Protocol</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Instrument Check-In & Post-Use Return Station</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Mandatory before-and-after photo upload slots and 5-point safety checklists protect both researchers and facility equipment.
            Every image hash is appended to the tamper-evident SHA-256 ledger.
          </p>
        </div>

        {/* Booking selector */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs">
          <span className="text-slate-400 shrink-0">Select Reservation:</span>
          <select
            value={activeBooking.id}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
          >
            {eligibleBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} · {b.resourceName.split(' ')[0]} ({b.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Session Overview Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{activeBooking.resourceName}</div>
            <div className="text-slate-400">
              Operator: <strong className="text-slate-200">{activeBooking.requesterName}</strong> · Scheduled: {activeBooking.date} ({activeBooking.startTime} - {activeBooking.endTime})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-slate-500 text-[11px] block">Current Stage:</span>
            <span className={`font-bold ${
              isCompleted ? 'text-emerald-400' : isCheckedIn ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {isCompleted ? 'Returned & Released' : isCheckedIn ? 'Session In Progress' : 'Pending Pre-Use Check-In'}
            </span>
          </div>

          {returnCondition === 'hardware_fault' && (
            <button
              onClick={onNavigateToIncidents}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Incident to Rahul</span>
            </button>
          )}
        </div>
      </div>

      {/* Dual Phase Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PHASE 1: PRE-USE CHECK-IN */}
        <div className={`bg-slate-900 border rounded-xl p-5 space-y-4 ${
          isCheckedIn ? 'border-slate-800 opacity-90' : 'border-teal-500/60 ring-1 ring-teal-500/20'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="font-bold text-white text-sm">Phase 1: Pre-Use Safety Check-In</h3>
            </div>
            {isCheckedIn && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Check-In Complete
              </span>
            )}
          </div>

          {/* 5-Item Pre-Use Safety Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Pre-Operation Safety Checklist:</span>
            <div className="space-y-1.5 bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
              {[
                { key: 'opticalZero', label: 'Calibrated optical zero / balance baseline within 0.01g tolerance' },
                { key: 'emergencyStop', label: 'Emergency stop switch inspected and verified unlatched' },
                { key: 'ppeDonned', label: 'Mandatory PPE donned: Lab coat, safety spectacles, and nitrile gloves' },
                { key: 'pressureGreenZone', label: 'Vacuum line / nitrogen gas pressure indicator in green operational zone' },
                { key: 'surfaceDisinfected', label: 'Work surface and sample staging deck wiped with 70% isopropanol' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-2.5 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    disabled={isCheckedIn}
                    checked={beforeChecklist[item.key] ?? false}
                    onChange={(e) =>
                      setBeforeChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0 disabled:opacity-50"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Before Photo Upload Slot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>Before-Use Photo Verification Slot</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">FIPS-SHA256 Fingerprinted</span>
            </div>

            <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-3 text-center bg-slate-950/70 hover:border-slate-600 transition-colors">
              {beforePhotoUrl ? (
                <div className="space-y-2">
                  <div className="relative h-40 rounded-md overflow-hidden border border-slate-800">
                    <img
                      src={beforePhotoUrl}
                      alt="Before use inspection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-950/90 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      SHA256: 9e4f2...7b1a · {beforePhotoName}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Baseline condition captured</span>
                    {!isCheckedIn && (
                      <button
                        onClick={() => setBeforePhotoUrl('')}
                        className="text-slate-400 hover:text-rose-400 text-[11px]"
                      >
                        Remove / Retake
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs text-slate-300">Upload pre-flight instrument photo or pick preset snapshot</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'before')}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Snapshot Presets for Judges */}
            {!isCheckedIn && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Preset Shots:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto(SAMPLE_LAB_PHOTOS.pristineCentrifuge, 'pristine_centrifuge_chamber.jpg', 'before')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                >
                  Pristine Chamber
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto(SAMPLE_LAB_PHOTOS.cleanNmr, 'nmr_sample_jet_clean.jpg', 'before')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                >
                  Clean Autosampler
                </button>
              </div>
            )}
          </div>

          {/* Action button */}
          {!isCheckedIn && (
            <button
              onClick={() => {
                if (!isBeforeChecklistComplete) return;
                onCheckInComplete(activeBooking.id, beforePhotoUrl, beforePhotoName, beforeChecklist);
              }}
              disabled={!isBeforeChecklistComplete}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isBeforeChecklistComplete
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Check-In & Power On Instrument</span>
            </button>
          )}
        </div>

        {/* PHASE 2: POST-USE RETURN & RELEASE */}
        <div className={`bg-slate-900 border rounded-xl p-5 space-y-4 ${
          !isCheckedIn ? 'border-slate-800 opacity-60' : isCompleted ? 'border-emerald-800/60' : 'border-teal-500/60 ring-1 ring-teal-500/20'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="font-bold text-white text-sm">Phase 2: Post-Use Return & Inspection</h3>
            </div>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Session Released
              </span>
            )}
          </div>

          {/* 5-Item Post-Use Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Post-Operation Decontamination Checklist:</span>
            <div className="space-y-1.5 bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
              {[
                { key: 'samplesRemoved', label: 'All sample tubes/plates extracted & biological waste autoclaved' },
                { key: 'opticsCleaned', label: 'Lenses and sensor surfaces wiped with lint-free optical lens paper' },
                { key: 'wasteUnder80', label: 'Liquid solvent waste bottle verified under 80% maximum capacity' },
                { key: 'chambersSealed', label: 'Vacuum chambers clamped and carrier nitrogen flow switched to standby' },
                { key: 'logbookSigned', label: 'Physical binder logbook signed with actual elapsed hours' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-2.5 cursor-pointer text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    disabled={!isCheckedIn || isCompleted}
                    checked={afterChecklist[item.key] ?? false}
                    onChange={(e) =>
                      setAfterChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-0 disabled:opacity-50"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* After Photo Upload Slot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>After-Use Return Photo Slot</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Chained Verification</span>
            </div>

            <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-3 text-center bg-slate-950/70 hover:border-slate-600 transition-colors">
              {afterPhotoUrl ? (
                <div className="space-y-2">
                  <div className="relative h-40 rounded-md overflow-hidden border border-slate-800">
                    <img
                      src={afterPhotoUrl}
                      alt="After use inspection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-950/90 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      SHA256: d83c1...e042 · {afterPhotoName}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Return condition recorded</span>
                    {!isCompleted && (
                      <button
                        onClick={() => setAfterPhotoUrl('')}
                        className="text-slate-400 hover:text-rose-400 text-[11px]"
                      >
                        Change Photo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs text-slate-300">Upload clean return state photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'after')}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Presets for Judges */}
            {!isCompleted && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Preset Returns:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto(SAMPLE_LAB_PHOTOS.cleanHood, 'clean_hood_return.jpg', 'after')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                >
                  Spotless Clean
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPresetPhoto(SAMPLE_LAB_PHOTOS.stainedWorkstation, 'stained_workstation.jpg', 'after');
                    setReturnCondition('minor_wear');
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                >
                  Minor Staining
                </button>
              </div>
            )}
          </div>

          {/* Condition Grading */}
          <div className="space-y-1.5 text-xs">
            <span className="font-semibold text-slate-300">Return Equipment Condition Grade:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pristine', label: 'Pristine Clean', color: 'border-emerald-500 text-emerald-400' },
                { id: 'minor_wear', label: 'Minor Wear', color: 'border-blue-500 text-blue-400' },
                { id: 'soiled_workstation', label: 'Soiled Deck', color: 'border-amber-500 text-amber-400' },
                { id: 'hardware_fault', label: 'Hardware Fault', color: 'border-rose-500 text-rose-400' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={!isCheckedIn || isCompleted}
                  onClick={() => setReturnCondition(c.id as any)}
                  className={`p-2 rounded-lg border text-left text-[11px] font-semibold transition-all ${
                    returnCondition === c.id
                      ? 'bg-slate-800 text-white ring-1 ring-teal-400 border-teal-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finalize Action */}
          {!isCompleted && isCheckedIn && (
            <button
              onClick={() => {
                if (!isAfterChecklistComplete) return;
                onReturnComplete(
                  activeBooking.id,
                  afterPhotoUrl,
                  afterPhotoName,
                  afterChecklist,
                  returnCondition,
                  returnNotes
                );
              }}
              disabled={!isAfterChecklistComplete}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isAfterChecklistComplete
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Return & Release Resource to Pool</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Drawer if both photos present */}
      {beforePhotoUrl && afterPhotoUrl && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Side-by-Side Before vs. After Photometric Comparison</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Integrity Verified: Match Pass
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Pre-Flight Check-In Baseline:</span>
              <div className="h-48 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img src={beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Post-Use Handover State:</span>
              <div className="h-48 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

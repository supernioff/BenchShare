import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { GuidedTourBanner } from './components/GuidedTourBanner';
import { ResourceDiscovery } from './components/ResourceDiscovery';
import { BookingModal } from './components/BookingModal';
import { ManagerReviewQueue } from './components/ManagerReviewQueue';
import { CheckInReturnSimulator } from './components/CheckInReturnSimulator';
import { IncidentManager } from './components/IncidentManager';
import { AuditLogViewer } from './components/AuditLogViewer';
import { LabOwnerDashboard } from './components/LabOwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  UserRole, 
  UserProfile, 
  Equipment, 
  BookingRequest, 
  IncidentReport, 
  AuditBlock 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_EQUIPMENT, 
  INITIAL_BOOKINGS, 
  INITIAL_INCIDENTS 
} from './data/mockData';
import { getInitialAuditChain, createNewBlock, computeBlockHash } from './lib/crypto';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Primary States
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentTab, setCurrentTab] = useState<string>('discovery');
  const [users, setUsers] = useState<Record<string, UserProfile>>(INITIAL_USERS);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_BOOKINGS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [auditChain, setAuditChain] = useState<AuditBlock[]>(getInitialAuditChain());
  const [weeklyQuotaLimit, setWeeklyQuotaLimit] = useState<number>(20.0);

  // Booking Modal State
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState<Equipment | null>(null);

  // Toast / System Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentUser = users[currentRole] || users.student;

  // Helper to log a new cryptographic block
  const appendAuditBlock = (
    action: string,
    actorName: string,
    actorRole: UserRole,
    payload: Record<string, any>
  ) => {
    setAuditChain((prevChain) => {
      const newBlock = createNewBlock(prevChain, action, actorName, actorRole, payload);
      return [...prevChain, newBlock];
    });
  };

  // Step 2: Submit Booking Request
  const handleBookingSubmit = (newBooking: BookingRequest) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Cryptographic audit log entry
    appendAuditBlock('BOOKING_REQUEST_CREATED', currentUser.name, currentUser.role, {
      bookingId: newBooking.id,
      resourceName: newBooking.resourceName,
      hoursRequested: newBooking.hours,
      effectiveQuotaHours: newBooking.effectiveQuotaHours,
      grantCode: newBooking.projectCode,
      status: 'PENDING_MANAGER_REVIEW',
    });
    showToast(`Reservation ${newBooking.id} created and hashed into SHA-256 Ledger!`);
  };

  // Step 3: Manager Decision (Approve / Reject / Waitlist)
  const handleManagerDecision = (
    bookingId: string,
    decision: 'approved' | 'rejected' | 'waitlisted',
    plainLanguageLog: string
  ) => {
    let affectedBooking: BookingRequest | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          affectedBooking = {
            ...b,
            status: decision,
            managerNotes: plainLanguageLog,
            decisionBy: users.manager.name,
            decisionAt: new Date().toISOString(),
          };
          return affectedBooking;
        }
        return b;
      })
    );

    // Cryptographic log
    appendAuditBlock(
      `MANAGER_DECISION_${decision.toUpperCase()}`,
      users.manager.name,
      'manager',
      {
        bookingId,
        decision,
        mandatoryPlainLanguageRationale: plainLanguageLog,
        requester: affectedBooking?.requesterName,
        resource: affectedBooking?.resourceName,
      }
    );

    showToast(`Decision '${decision.toUpperCase()}' logged to SHA-256 chain with plain-language rationale.`);
  };

  // Step 4A: Pre-Use Check-In Complete
  const handleCheckInComplete = (
    bookingId: string,
    photoUrl: string,
    photoName: string,
    checklist: Record<string, boolean>
  ) => {
    let matchedResourceName = '';
    let matchedResourceId = '';

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          matchedResourceName = b.resourceName;
          matchedResourceId = b.resourceId;
          return {
            ...b,
            status: 'active',
            checkInState: {
              ...b.checkInState,
              checkedInAt: new Date().toISOString(),
              beforePhotoUrl: photoUrl,
              beforePhotoName: photoName,
              beforeChecklist: checklist,
              afterChecklist: b.checkInState?.afterChecklist || {},
            },
          };
        }
        return b;
      })
    );

    // Mark equipment in_use
    if (matchedResourceId) {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === matchedResourceId ? { ...e, status: 'in_use' } : e))
      );
    }

    appendAuditBlock('PRE_USE_CHECKIN_VERIFIED', currentUser.name, currentUser.role, {
      bookingId,
      resourceName: matchedResourceName,
      safetyChecklistPassed: true,
      photoName,
      photoFingerprint: 'sha256-verified-img',
      powerState: 'INSTRUMENT_ACTIVATED',
    });

    showToast('Check-in verified: Safety checklist validated & photo fingerprinted!');
  };

  // Step 4B: Post-Use Return Complete
  const handleReturnComplete = (
    bookingId: string,
    photoUrl: string,
    photoName: string,
    checklist: Record<string, boolean>,
    condition: 'pristine' | 'minor_wear' | 'soiled_workstation' | 'hardware_fault',
    notes: string
  ) => {
    let hoursDeducted = 3.0;
    let matchedResourceId = '';
    let matchedResourceName = '';

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          hoursDeducted = b.effectiveQuotaHours;
          matchedResourceId = b.resourceId;
          matchedResourceName = b.resourceName;
          return {
            ...b,
            status: 'completed',
            checkInState: {
              ...b.checkInState,
              returnedAt: new Date().toISOString(),
              afterPhotoUrl: photoUrl,
              afterPhotoName: photoName,
              afterChecklist: checklist,
              returnCondition: condition,
              returnNotes: notes,
            },
          };
        }
        return b;
      })
    );

    // Free the equipment
    if (matchedResourceId) {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === matchedResourceId ? { ...e, status: 'available' } : e))
      );
    }

    // Update Alice's quota used
    setUsers((prev) => {
      const student = prev.student;
      return {
        ...prev,
        student: {
          ...student,
          usedWeeklyHours: Math.min(student.weeklyQuotaHours, student.usedWeeklyHours + 0.5),
        },
      };
    });

    appendAuditBlock('POST_USE_RETURN_COMPLETED', currentUser.name, currentUser.role, {
      bookingId,
      resourceName: matchedResourceName,
      decontaminationChecklistPassed: true,
      returnConditionGrade: condition,
      afterPhotoName: photoName,
      status: 'EQUIPMENT_RELEASED_TO_POOL',
    });

    showToast('Session finalized! Equipment decontaminated and returned to shared pool.');
  };

  // Step 5: Submit Incident Report
  const handleSubmitIncident = (incident: IncidentReport) => {
    setIncidents((prev) => [incident, ...prev]);

    appendAuditBlock('INCIDENT_REPORTED_AI_SUMMARIZED', currentUser.name, currentUser.role, {
      incidentId: incident.id,
      equipment: incident.resourceName,
      severity: incident.severity,
      aiRiskClassification: incident.aiSummary?.riskLevel || 'MEDIUM',
      capaStepsCount: incident.aiSummary?.recommendedCAPA.length || 0,
    });

    showToast(`Incident #${incident.id} logged with a drafted analysis for Manager Rahul.`);
  };

  // Resolve Incident
  const handleResolveIncident = (incidentId: string, resolutionNotes: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'resolved',
              resolutionNotes,
              resolvedAt: new Date().toISOString(),
            }
          : inc
      )
    );

    appendAuditBlock('INCIDENT_RESOLVED_CAPA_APPROVED', users.manager.name, 'manager', {
      incidentId,
      resolvedBy: users.manager.name,
      resolutionNotes,
    });

    showToast(`Incident #${incidentId} resolved and signed off.`);
  };

  // Step 6: Malicious Tamper Simulator & Restore
  const handleTamperBlock = (index: number, modifiedPayload: Record<string, any>) => {
    setAuditChain((prevChain) =>
      prevChain.map((b) => {
        if (b.index === index) {
          // Keep original stored hash to demonstrate tamper detection, or modify payload
          return {
            ...b,
            payload: modifiedPayload,
            isTampered: true,
          };
        }
        return b;
      })
    );
    showToast(`Block #${index} altered! Check the red cryptographic integrity failure banner.`, 'alert');
  };

  const handleRestoreChain = () => {
    setAuditChain(getInitialAuditChain());
    showToast('Cryptographic ledger reset to pristine verified state.');
  };

  // Step 7: Update Equipment by Dr. Sharma
  const handleUpdateEquipment = (updated: Equipment, auditReason: string) => {
    setEquipmentList((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    appendAuditBlock('EQUIPMENT_CONFIG_UPDATED', users.owner.name, 'owner', {
      equipmentId: updated.id,
      equipmentName: updated.name,
      status: updated.status,
      isBlackedOut: updated.isBlackedOut,
      blackoutReason: updated.blackoutReason,
      requiredBadges: updated.requiredBadges,
      auditReason,
    });
    showToast(`Dr. Sharma updated ${updated.name} settings.`);
  };

  // Step 8: Toggle User Badge (Admin or interactive tester)
  const handleToggleUserBadge = (userId: string, badgeCode: string) => {
    setUsers((prev) => {
      const targetUser = prev.student;
      const hasBadge = targetUser.trainingBadges.includes(badgeCode);
      const updatedBadges = hasBadge
        ? targetUser.trainingBadges.filter((b) => b !== badgeCode)
        : [...targetUser.trainingBadges, badgeCode];

      return {
        ...prev,
        student: {
          ...targetUser,
          trainingBadges: updatedBadges,
        },
      };
    });

    const isNowGranted = !users.student.trainingBadges.includes(badgeCode);
    appendAuditBlock(
      isNowGranted ? 'TRAINING_CREDENTIAL_GRANTED' : 'TRAINING_CREDENTIAL_REVOKED',
      users.admin.name,
      'admin',
      {
        recipient: users.student.name,
        badgeCode,
        action: isNowGranted ? 'GRANTED' : 'REVOKED',
      }
    );

    showToast(
      isNowGranted
        ? `Granted ${badgeCode} to Alice Chen. Equipment eligibility updated!`
        : `Revoked ${badgeCode} from Alice Chen.`
    );
  };

  // Update Campus Quota Limit
  const handleUpdateWeeklyQuotaLimit = (limit: number) => {
    setWeeklyQuotaLimit(limit);
    setUsers((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        weeklyQuotaHours: limit,
      },
    }));
    appendAuditBlock('CAMPUS_QUOTA_POLICY_MODIFIED', users.admin.name, 'admin', {
      newStudentCapHours: limit,
      effectiveCycle: 'Immediate Rolling 7-Day Window',
    });
    showToast(`Campus weekly quota limit set to ${limit} hours.`);
  };

  // Reset entire demo
  const handleResetDemo = () => {
    setUsers(INITIAL_USERS);
    setEquipmentList(INITIAL_EQUIPMENT);
    setBookings(INITIAL_BOOKINGS);
    setIncidents(INITIAL_INCIDENTS);
    setAuditChain(getInitialAuditChain());
    setCurrentRole('student');
    setCurrentTab('discovery');
    showToast('Simulation state reset to default demo values.');
  };

  // Counts for Badges in Navbar
  const pendingReviewCount = bookings.filter((b) => b.status === 'pending').length;
  const activeSessionCount = bookings.filter((b) => b.status === 'active' || b.status === 'approved').length;
  const tamperCount = auditChain.filter((b) => b.isTampered).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* 10-Step Interactive Workflow Navigator Bar */}
      <GuidedTourBanner
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onResetDemo={handleResetDemo}
      />

      {/* Main Institutional Header & 4-Role Switcher */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          // Suggest convenient landing tab for that role
          if (role === 'manager' && currentTab !== 'review') setCurrentTab('review');
          if (role === 'owner' && currentTab !== 'owner') setCurrentTab('owner');
          if (role === 'admin' && currentTab !== 'admin' && currentTab !== 'audit') setCurrentTab('audit');
        }}
        currentUser={currentUser}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingReviewCount={pendingReviewCount}
        activeSessionCount={activeSessionCount}
        tamperCount={tamperCount}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <aside aria-label="System Notifications" className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
              toastMessage.type === 'alert'
                ? 'bg-rose-950/95 border-rose-700 text-rose-200'
                : 'bg-teal-950/95 border-teal-700 text-teal-200'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </aside>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'discovery' && (
          <ResourceDiscovery
            equipmentList={equipmentList}
            currentUser={currentUser}
            onOpenBookingModal={(eq) => setSelectedEquipmentForBooking(eq)}
            onToggleBadgeSimulation={(code) => handleToggleUserBadge('usr-alice', code)}
          />
        )}

        {currentTab === 'review' && (
          <ManagerReviewQueue
            bookings={bookings}
            onDecision={handleManagerDecision}
            onNavigateToCheckIn={(booking) => {
              setCurrentRole('student');
              setCurrentTab('checkin');
            }}
            currentRole={currentRole}
            onSwitchToManager={() => setCurrentRole('manager')}
          />
        )}

        {currentTab === 'checkin' && (
          <CheckInReturnSimulator
            bookings={bookings}
            equipmentList={equipmentList}
            currentUser={currentUser}
            currentRole={currentRole}
            onCheckInComplete={handleCheckInComplete}
            onReturnComplete={handleReturnComplete}
            onNavigateToIncidents={() => setCurrentTab('incidents')}
          />
        )}

        {currentTab === 'incidents' && (
          <IncidentManager
            incidents={incidents}
            equipmentList={equipmentList}
            currentUser={currentUser}
            currentRole={currentRole}
            onSubmitIncident={handleSubmitIncident}
            onResolveIncident={handleResolveIncident}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogViewer
            chain={auditChain}
            onTamperBlock={handleTamperBlock}
            onRestoreChain={handleRestoreChain}
            currentRole={currentRole}
          />
        )}

        {currentTab === 'owner' && (
          <LabOwnerDashboard
            equipmentList={equipmentList}
            onUpdateEquipment={handleUpdateEquipment}
            currentUser={currentUser}
            currentRole={currentRole}
            onSwitchToOwner={() => setCurrentRole('owner')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            users={users}
            onToggleUserBadge={handleToggleUserBadge}
            auditChain={auditChain}
            weeklyQuotaLimit={weeklyQuotaLimit}
            onUpdateWeeklyQuotaLimit={handleUpdateWeeklyQuotaLimit}
            currentRole={currentRole}
            onSwitchToAdmin={() => setCurrentRole('admin')}
          />
        )}
      </main>

      {/* Step 2 Reservation Modal */}
      {selectedEquipmentForBooking && (
        <BookingModal
          equipment={selectedEquipmentForBooking}
          currentUser={currentUser}
          isOpen={!!selectedEquipmentForBooking}
          onClose={() => setSelectedEquipmentForBooking(null)}
          onSubmitBooking={handleBookingSubmit}
          onNavigateToReviewQueue={() => {
            setCurrentRole('manager');
            setCurrentTab('review');
          }}
        />
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">BenchShare</span>
            <span>· Institutional Resource-Sharing & Cryptographic Audit System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>FIPS 180-4 SHA-256 Ledger Active</span>
            <span>·</span>
            <span>IBC Biosafety Standards</span>
            <span>·</span>
            <span>Rolling 7-Day Quotas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

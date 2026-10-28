export type UserRole = 'student' | 'owner' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  email: string;
  avatarUrl: string;
  trainingBadges: string[];
  weeklyQuotaHours: number;
  usedWeeklyHours: number;
  grantCodes: string[];
}

export type EquipmentCategory = 
  | 'Spectroscopy'
  | 'Electron Microscopy'
  | 'Chromatography'
  | 'Cell Culture & Cleanroom'
  | 'Centrifuges & Thermal';

export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'reserved';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  category: EquipmentCategory;
  location: string;
  building: string;
  custodian: string;
  custodianId: string;
  custodianEmail: string;
  hourlyRate: number;
  peakHours: string; // e.g. "09:00 - 17:00"
  status: EquipmentStatus;
  requiredBadges: string[];
  imageUrl: string;
  specs: string[];
  safetyLevel: 'Standard' | 'BSL-2' | 'Laser Class 3B' | 'Cryogenic' | 'High Voltage';
  safetyPrecautions: string[];
  maintenanceSchedule: string;
  isBlackedOut?: boolean;
  blackoutReason?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'active' | 'completed' | 'cancelled';

export interface CheckInState {
  checkedInAt?: string;
  returnedAt?: string;
  beforePhotoUrl?: string;
  beforePhotoName?: string;
  afterPhotoUrl?: string;
  afterPhotoName?: string;
  beforeChecklist?: Record<string, boolean>;
  afterChecklist?: Record<string, boolean>;
  returnCondition?: 'pristine' | 'minor_wear' | 'soiled_workstation' | 'hardware_fault';
  returnNotes?: string;
}

export interface BookingRequest {
  id: string;
  resourceId: string;
  resourceName: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  requesterEmail: string;
  projectCode: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  isPeak: boolean;
  effectiveQuotaHours: number; // calculated with peak multiplier (e.g. 1.0x vs 0.5x)
  supervisorEndorsement: boolean;
  purpose: string;
  status: BookingStatus;
  requestedAt: string;
  managerNotes?: string;
  decisionBy?: string;
  decisionAt?: string;
  checkInState?: CheckInState;
}

export interface AISummary {
  executiveSummary: string;
  rootCause: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  biosafetyCompliance: string;
  recommendedCAPA: string[];
  disciplinaryAssessment: string;
  generatedAt: string;
  modelUsed: string;
}

export interface IncidentReport {
  id: string;
  resourceId: string;
  resourceName: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  timestamp: string;
  severity: 'minor' | 'moderate' | 'critical';
  title: string;
  rawDescription: string;
  photoUrl?: string;
  photoName?: string;
  immediateActionsTaken: string;
  aiSummary?: AISummary;
  status: 'submitted' | 'under_review' | 'resolved' | 'escalated';
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  payload: Record<string, any>;
  prevHash: string;
  hash: string;
  isTampered?: boolean;
}

export interface TrainingBadgeInfo {
  code: string;
  name: string;
  level: string;
  validUntil: string;
  issuingAuthority: string;
  description: string;
}

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Building, 
  Sparkles,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Equipment, EquipmentCategory, UserProfile } from '../types';
import { TRAINING_BADGES } from '../data/mockData';

interface ResourceDiscoveryProps {
  equipmentList: Equipment[];
  currentUser: UserProfile;
  onOpenBookingModal: (equipment: Equipment) => void;
  onToggleBadgeSimulation?: (badgeCode: string) => void;
}

export const ResourceDiscovery: React.FC<ResourceDiscoveryProps> = ({
  equipmentList,
  currentUser,
  onOpenBookingModal,
  onToggleBadgeSimulation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedEquipmentForDetails, setSelectedEquipmentForDetails] = useState<Equipment | null>(null);

  const categories = [
    'All',
    'Spectroscopy',
    'Electron Microscopy',
    'Chromatography',
    'Cell Culture & Cleanroom',
    'Centrifuges & Thermal',
  ];

  // Eligibility evaluation function
  const checkEligibility = (requiredBadges: string[]) => {
    const userBadges = new Set(currentUser.trainingBadges);
    const missing = requiredBadges.filter((b) => !userBadges.has(b));
    return {
      isEligible: missing.length === 0,
      missingBadges: missing,
    };
  };

  // Filtered equipment list
  const filteredEquipment = equipmentList.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.custodian.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && item.status === 'available') ||
      (availabilityFilter === 'in_use' && item.status === 'in_use') ||
      (availabilityFilter === 'maintenance' && item.status === 'maintenance');

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Header and Workflow Step Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Step 1: Discovery & Training Eligibility</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Institutional Facility Directory</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Shared Research Instrumentation & Bench Catalog</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time access to high-end spectrometers, electron microscopes, cleanroom hoods, and ultracentrifuges.
            Access is automatically validated against your institutional training credentials.
          </p>
        </div>

        {/* Live Training Credential Badges & Judge Interactive Tester */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>{currentUser.name}'s Credentials</span>
            </span>
            <span className="text-[10px] text-slate-400">{currentUser.trainingBadges.length} Active</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2.5">
            {currentUser.trainingBadges.map((badge) => (
              <span
                key={badge}
                className="bg-teal-950/70 border border-teal-800 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono font-medium"
              >
                ✓ {badge}
              </span>
            ))}
          </div>

          {/* Quick toggle for judges to test Titan Krios eligibility */}
          {onToggleBadgeSimulation && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onToggleBadgeSimulation('CRYO-SAFETY-4')}
                className="w-full text-[11px] py-1 px-2 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-between"
              >
                <span>Interactive Test: {currentUser.trainingBadges.includes('CRYO-SAFETY-4') ? 'Revoke Cryo' : 'Grant CRYO-SAFETY-4'}</span>
                <Zap className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Category Pills (Functional Filter Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">Categories:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input & availability filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by instrument name, model, room, or custodian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="in_use">In Active Use</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((equipment) => {
          const { isEligible, missingBadges } = checkEligibility(equipment.requiredBadges);

          return (
            <div
              key={equipment.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm transition-all hover:border-slate-600 ${
                isEligible ? 'border-slate-800' : 'border-slate-800/90'
              }`}
            >
              {/* Image & Status Badge Overlay */}
              <div className="relative h-44 bg-slate-950 overflow-hidden group">
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Status indicator */}
                <div className="absolute top-3 left-3">
                  {equipment.status === 'available' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 backdrop-blur-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Available
                    </span>
                  )}
                  {equipment.status === 'in_use' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-700/80 backdrop-blur-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      In Active Session
                    </span>
                  )}
                  {equipment.status === 'maintenance' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/90 text-amber-300 border border-amber-700/80 backdrop-blur-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Maintenance Window
                    </span>
                  )}
                </div>

                {/* Category kicker */}
                <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  {equipment.category}
                </div>

                {/* Hourly rate footer on image */}
                <div className="absolute bottom-2 left-3 text-xs text-slate-300">
                  <span className="text-white font-bold text-base">${equipment.hourlyRate}</span> / hour
                  <span className="text-slate-400 text-[10px] ml-1.5">(0.5x off-peak)</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                    {equipment.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{equipment.model}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{equipment.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Custodian: <span className="text-slate-300 font-medium">{equipment.custodian}</span>
                  </div>

                  {/* Mandatory Requirement 1: Eligible / Not Eligible Badge */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium mb-1.5">Required Training Credentials:</div>
                    {isEligible ? (
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-emerald-200">Eligible to Book</div>
                          <div className="text-[11px] text-emerald-400/90">
                            Verified: {equipment.requiredBadges.join(', ')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-2 text-xs">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-rose-200">Not Eligible</div>
                          <div className="text-[11px] text-rose-300/90">
                            Missing required: <span className="font-mono font-bold">{missingBadges.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenBookingModal(equipment)}
                      disabled={!isEligible || equipment.status === 'maintenance'}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        !isEligible
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                          : equipment.status === 'maintenance'
                          ? 'bg-amber-950/40 text-amber-400 cursor-not-allowed border border-amber-800/50'
                          : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{equipment.status === 'maintenance' ? 'In Maintenance' : 'Reserve Slot'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedEquipmentForDetails(equipment)}
                      title="Inspect equipment safety specs & protocol"
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Details Drawer / Modal */}
      {selectedEquipmentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">{selectedEquipmentForDetails.category}</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedEquipmentForDetails.name}</h3>
                <p className="text-xs text-slate-400">{selectedEquipmentForDetails.model}</p>
              </div>
              <button
                onClick={() => setSelectedEquipmentForDetails(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Technical Specifications</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {selectedEquipmentForDetails.specs.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Standard Safety Precautions & PPE</h4>
                <ul className="list-disc list-inside space-y-1 text-amber-300/90">
                  {selectedEquipmentForDetails.safetyPrecautions.map((safe, i) => (
                    <li key={i}>{safe}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300">
                <span className="text-slate-400">Custodian Maintenance Schedule: </span>
                <span>{selectedEquipmentForDetails.maintenanceSchedule}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEquipmentForDetails(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const eq = selectedEquipmentForDetails;
                  setSelectedEquipmentForDetails(null);
                  onOpenBookingModal(eq);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg"
              >
                Proceed to Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

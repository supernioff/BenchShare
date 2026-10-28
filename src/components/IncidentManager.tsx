import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Camera, 
  Send, 
  Clock, 
  User, 
  Cpu, 
  Check, 
  RefreshCw,
  Flame,
  ArrowRight
} from 'lucide-react';
import { IncidentReport, Equipment, UserProfile, UserRole, AISummary } from '../types';
import { summarizeIncidentWithAI } from '../lib/aiSummarizer';
import { SAMPLE_LAB_PHOTOS } from '../data/mockData';

interface IncidentManagerProps {
  incidents: IncidentReport[];
  equipmentList: Equipment[];
  currentUser: UserProfile;
  currentRole: UserRole;
  onSubmitIncident: (incident: IncidentReport) => void;
  onResolveIncident: (incidentId: string, resolutionNotes: string) => void;
}

export const IncidentManager: React.FC<IncidentManagerProps> = ({
  incidents,
  equipmentList,
  currentUser,
  currentRole,
  onSubmitIncident,
  onResolveIncident,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncidentForView, setSelectedIncidentForView] = useState<IncidentReport | null>(incidents[0] || null);

  // Form states
  const [resourceId, setResourceId] = useState(equipmentList[0]?.id || 'eq-1');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'critical'>('moderate');
  const [title, setTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [immediateActionsTaken, setImmediateActionsTaken] = useState('');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_LAB_PHOTOS.stainedWorkstation);
  const [photoName, setPhotoName] = useState('incident_station_capture.jpg');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [draftAISummary, setDraftAISummary] = useState<AISummary | null>(null);
  const [managerResolutionNote, setManagerResolutionNote] = useState('');

  // Sample presets for judges to test with 1 click
  const loadPreset = (preset: 'nmr' | 'centrifuge' | 'spill') => {
    if (preset === 'nmr') {
      setResourceId('eq-1');
      setSeverity('moderate');
      setTitle('Sample spinner pneumatic ejection failure in 600 MHz magnet bore');
      setRawDescription(
        'During automated sample release in TopSpin 4.1, acoustic sensor tripped and the 5mm sample tube remained wedged at the lower cryogenic air-bearing. System logged #ERR-BORE-PNEUM-09. No manual metal tweezers were inserted to avoid CryoProbe quartz sleeve fracture.'
      );
      setImmediateActionsTaken(
        'Aborted TopSpin acquisition loop, turned off pneumatic air lift, affixed red warning sign on SampleJet carousel, and notified Dr. Sharma and Core Director Rahul Verma.'
      );
    } else if (preset === 'centrifuge') {
      setResourceId('eq-3');
      setSeverity('critical');
      setTitle('Rotor dynamic unbalance vibration alarm tripped at 42,000 RPM');
      setRawDescription(
        'Ultracentrifuge began high-frequency audible resonance at 42,000 RPM. Dynamic rotor inertia sensor triggered automated emergency dynamic braking. Inspection revealed small micro-fracture or fluid leak in Bucket #4 sucrose cushion.'
      );
      setImmediateActionsTaken(
        'Pressed emergency stop panel, waited 18 minutes for vacuum decel chamber to reach 0 RPM, did not open lid until vacuum gauge released, isolated prep room.'
      );
    } else if (preset === 'spill') {
      setResourceId('eq-5');
      setSeverity('minor');
      setTitle('Disinfectant bleach droplet splash onto biosafety cabinet sash frame');
      setRawDescription(
        'While performing 10% sodium hypochlorite washdown, approx 15mL of bleach solution spilled onto the lower stainless intake grille and acrylic sash border. No biological pathogen aerosolization occurred.'
      );
      setImmediateActionsTaken(
        'Immediately neutralized with sterile deionized water and 70% IPA wipe-down, placed warning tape over drainage trough.'
      );
    }
  };

  const handleRunAISummariser = async () => {
    if (!rawDescription) {
      alert('Please enter or load an incident description first!');
      return;
    }

    setIsGeneratingAI(true);
    const eq = equipmentList.find((e) => e.id === resourceId);
    try {
      const summary = await summarizeIncidentWithAI({
        equipmentName: eq ? eq.name : 'Laboratory Instrument',
        severity,
        rawDescription,
        immediateActionsTaken,
        reporterName: currentUser.name,
      });
      setDraftAISummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipmentList.find((e) => e.id === resourceId);
    const newReport: IncidentReport = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      resourceId,
      resourceName: eq ? eq.name : 'Laboratory Equipment',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      timestamp: new Date().toISOString(),
      severity,
      title: title || 'Reported Laboratory Anomaly',
      rawDescription,
      immediateActionsTaken,
      photoUrl,
      photoName,
      aiSummary: draftAISummary || undefined,
      status: 'under_review',
    };

    onSubmitIncident(newReport);
    setIsModalOpen(false);
    setSelectedIncidentForView(newReport);
    // Reset form
    setTitle('');
    setRawDescription('');
    setImmediateActionsTaken('');
    setDraftAISummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Step 5: Incident & Dispute Reporting</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Institutional EHS & CAPA Protocol</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Laboratory Incidents, Faults & AI Summariser</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Empowers students and lab custodians to report equipment errors, spills, or disputes transparently.
            The built-in <strong className="text-teal-300">AI Incident Summariser</strong> parses technical descriptions into institutional CAPA & OSHA compliance briefs.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            if (!rawDescription) loadPreset('nmr');
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident or Dispute</span>
        </button>
      </div>

      {/* Incidents Master/Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Incident list */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Logged Incidents ({incidents.length})
          </div>

          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = selectedIncidentForView?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentForView(inc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-slate-400 text-[11px]">{inc.id}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : inc.severity === 'moderate'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inc.resourceName}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 mt-2 border-t border-slate-800/80">
                    <span>By: {inc.reporterName}</span>
                    <span className="flex items-center gap-1">
                      {inc.aiSummary && <Sparkles className="w-3 h-3 text-teal-400" />}
                      <span className={inc.status === 'resolved' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {inc.status.toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Incident Deep Dive with AI Summary & Manager Resolution */}
        <div className="lg:col-span-2">
          {selectedIncidentForView ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 text-slate-100">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">Incident #{selectedIncidentForView.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">
                      Logged {new Date(selectedIncidentForView.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedIncidentForView.title}</h2>
                  <p className="text-xs text-teal-400 font-medium">{selectedIncidentForView.resourceName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                      selectedIncidentForView.severity === 'critical'
                        ? 'bg-rose-950 border-rose-800 text-rose-300'
                        : selectedIncidentForView.severity === 'moderate'
                        ? 'bg-amber-950 border-amber-800 text-amber-300'
                        : 'bg-blue-950 border-blue-800 text-blue-300'
                    }`}
                  >
                    Severity: {selectedIncidentForView.severity}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                      selectedIncidentForView.status === 'resolved'
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                        : 'bg-amber-950 border-amber-800 text-amber-300'
                    }`}
                  >
                    {selectedIncidentForView.status}
                  </span>
                </div>
              </div>

              {/* Raw Report Details */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Operator Event Narrative ({selectedIncidentForView.reporterName})
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                  {selectedIncidentForView.rawDescription}
                </div>
                <div className="text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <strong className="text-slate-400">Immediate Action Taken: </strong>
                  <span className="text-slate-300">{selectedIncidentForView.immediateActionsTaken || 'Area quarantined.'}</span>
                </div>
              </div>

              {/* AI Incident Summariser Output Panel */}
              {selectedIncidentForView.aiSummary && (
                <div className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-teal-900/60">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          AI Incident Summariser & Risk Brief
                        </h3>
                        <span className="text-[10px] text-teal-400 font-mono">
                          Generated via {selectedIncidentForView.aiSummary.modelUsed}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 border border-teal-700 text-teal-300">
                      Risk Level: {selectedIncidentForView.aiSummary.riskLevel}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Executive Summary for Facility Manager:</span>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-teal-900/40">
                        {selectedIncidentForView.aiSummary.executiveSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-400 block text-[11px] mb-1">Root Cause Hypothesis:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {selectedIncidentForView.aiSummary.rootCause}
                        </p>
                      </div>

                      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-400 block text-[11px] mb-1">Biosafety & Compliance:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {selectedIncidentForView.aiSummary.biosafetyCompliance}
                        </p>
                      </div>
                    </div>

                    {/* CAPA Steps */}
                    <div className="pt-2">
                      <span className="font-semibold text-slate-300 block mb-1.5">
                        Recommended Corrective & Preventive Actions (CAPA):
                      </span>
                      <ul className="space-y-1 bg-slate-950/80 p-3 rounded-lg border border-teal-900/40 text-xs">
                        {selectedIncidentForView.aiSummary.recommendedCAPA.map((capa, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-teal-400 font-bold">✓</span>
                            <span>{capa}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Disciplinary Assessment */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
                      <strong className="text-slate-400">Disciplinary Evaluation: </strong>
                      <span className="text-slate-300">{selectedIncidentForView.aiSummary.disciplinaryAssessment}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Manager Resolution Section */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Manager Resolution & Arbitration (Rahul Verma / Dr. Sharma)
                  </span>
                  {selectedIncidentForView.resolvedAt && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Resolved {new Date(selectedIncidentForView.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {selectedIncidentForView.status === 'resolved' ? (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-200">
                    <strong>Official Resolution: </strong>
                    <span>{selectedIncidentForView.resolutionNotes || 'CAPA approved. Equipment restored to available status.'}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={managerResolutionNote}
                      onChange={(e) => setManagerResolutionNote(e.target.value)}
                      placeholder="Rahul: Enter formal resolution notes, sign-off on AI CAPA recommendations, and release equipment..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          onResolveIncident(
                            selectedIncidentForView.id,
                            managerResolutionNote || 'CAPA validated by Rahul Verma. Instrument cleared for operational service.'
                          )
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sign Off on CAPA & Resolve Incident</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              Select an incident from the list to view the AI analysis.
            </div>
          )}
        </div>
      </div>

      {/* Report New Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  File Formal Report
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Laboratory Incident & Dispute Reporting</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Test Presets for Judge */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400 font-medium">Quick Preset Templates:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => loadPreset('nmr')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px]"
                >
                  NMR Tube Jam
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('centrifuge')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px]"
                >
                  Centrifuge Imbalance
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('spill')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px]"
                >
                  Hood Chemical Splash
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Involved Equipment</label>
                  <select
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Severity Classification</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="minor">Minor (Cosmetic / Delay)</option>
                    <option value="moderate">Moderate (Component Fault / Sensor Alarm)</option>
                    <option value="critical">Critical (Spill / Cryogen Quench / Severe Damage)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Incident Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sample tube pneumatic lift stuck during autoloader cycle..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Raw Technical Description</label>
                <textarea
                  rows={3}
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  placeholder="Describe exactly what occurred, error codes, and symptoms..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-400 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Immediate Containment Action Taken</label>
                <input
                  type="text"
                  value={immediateActionsTaken}
                  onChange={(e) => setImmediateActionsTaken(e.target.value)}
                  placeholder="e.g. Emergency stop depressed, room door locked, PI SMS dispatched..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              {/* AI Incident Summariser Trigger Button */}
              <div className="bg-slate-950 border border-teal-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="font-bold text-white">AI Incident Summariser</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAISummariser}
                    disabled={isGeneratingAI || !rawDescription}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing EHS Brief...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Incident Summariser</span>
                      </>
                    )}
                  </button>
                </div>

                {draftAISummary ? (
                  <div className="bg-slate-900/90 border border-teal-800/80 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center text-teal-300 font-semibold">
                      <span>✓ EHS Analysis Drafted Successfully</span>
                      <span className="text-[10px] text-slate-400">Risk: {draftAISummary.riskLevel}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {draftAISummary.executiveSummary}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Recommended CAPA: {draftAISummary.recommendedCAPA.length} actionable steps generated.
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Click the button above to have Gemini AI analyze the description, determine OSHA risk level, and formulate CAPA recommendations for Manager Rahul.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <span>Submit Incident to Manager Queue</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

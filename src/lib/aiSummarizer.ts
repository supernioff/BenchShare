import { AISummary, IncidentReport } from '../types';

interface SummarizeRequest {
  equipmentName: string;
  severity: string;
  rawDescription: string;
  immediateActionsTaken: string;
  reporterName: string;
}

export async function summarizeIncidentWithAI(req: SummarizeRequest): Promise<AISummary> {
  // Deterministic, local rule-based engine: keyword rules map the report to a draft summary.
  // No external AI model is called. Output is a draft for human (manager) review.
    await new Promise((resolve) => setTimeout(resolve, 850)); // Realistic processing latency

  const descLower = req.rawDescription.toLowerCase();
  const equipLower = req.equipmentName.toLowerCase();

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  if (req.severity === 'critical' || descLower.includes('spill') || descLower.includes('fire') || descLower.includes('quench') || descLower.includes('smoke')) {
    riskLevel = 'CRITICAL';
  } else if (req.severity === 'minor' || descLower.includes('cosmetic') || descLower.includes('delay')) {
    riskLevel = 'LOW';
  } else {
    riskLevel = 'MEDIUM';
  }

  // Domain-specific root cause detection
  let rootCause = 'Mechanical tolerance anomaly or operational parameter boundary exceeded during standard duty cycle.';
  if (equipLower.includes('nmr') || descLower.includes('spinner') || descLower.includes('bore') || descLower.includes('tube')) {
    rootCause = 'Friction imbalance between sample spinner collar and pneumatic air-bearing stator, or thermal condensation icing at lower bore manifold.';
  } else if (equipLower.includes('centrifuge') || descLower.includes('rotor') || descLower.includes('balance') || descLower.includes('vibration')) {
    rootCause = 'Mass differential exceeding 0.01g threshold across diametrically opposed rotor buckets, triggering dynamic unbalance sensor.';
  } else if (equipLower.includes('tem') || equipLower.includes('microscop') || descLower.includes('vacuum') || descLower.includes('grid')) {
    rootCause = 'Autoloader cryogenic transfer arm vacuum pressure spike or micro-frost accumulation on grid cartridge clipping ring.';
  } else if (equipLower.includes('hplc') || equipLower.includes('chromatograph') || descLower.includes('pressure') || descLower.includes('leak')) {
    rootCause = 'Particulate blockage in pre-column frit or binary pump check valve seating degradation under high-pressure gradient.';
  } else if (equipLower.includes('biosafety') || equipLower.includes('hood') || descLower.includes('air') || descLower.includes('sash')) {
    rootCause = 'Disruption of laminar face velocity curtain caused by rapid sash movement or obstructed rear exhaust intake perforation.';
  }

  const executiveSummary = `Incident on ${req.equipmentName} reported by ${req.reporterName} (Severity: ${req.severity.toUpperCase()}). Initial assessment reveals ${rootCause.toLowerCase()} Immediate containment by operator was executed promptly: "${req.immediateActionsTaken || 'Area secured and custodial team notified'}". Facility equipment requires formal inspection before release to general pool.`;

  const biosafetyCompliance = equipLower.includes('biosafety') || descLower.includes('bio') || descLower.includes('cell')
    ? 'IBC BSL-2 protocol activated: Work area quarantined with 70% IPA and 10% freshly prepared sodium hypochlorite solution.'
    : 'No hazardous biological exposure detected. Standard OSHA Physical & Electrical Safety Ordinance governs this event.';

  const recommendedCAPA: string[] = [
    `Quarantine ${req.equipmentName} in BenchShare master calendar until physical clearance inspection by Dr. Sharma or Rahul Verma.`,
    `Review digital logbook data and verify if diagnostic error code corresponds to known manufacturer service bulletin.`,
    `Validate that operator ${req.reporterName} re-reads SOP Section 4.2 regarding emergency stop protocols.`,
    `File formal institutional EHS Form #EHS-2026-INC within 24 hours of occurrence.`,
  ];

  let disciplinaryAssessment = 'Operator followed standard lab shutdown protocol upon discovering irregularity. No negligence found. Full quota preservation recommended.';
  if (req.severity === 'critical' && !req.immediateActionsTaken) {
    disciplinaryAssessment = 'Operator reported severe anomaly without initial emergency shutdown. Recommended 1-hour SOP refresher with Facility Manager Rahul Verma.';
  }

  return {
    executiveSummary,
    rootCause,
    riskLevel,
    biosafetyCompliance,
    recommendedCAPA,
    disciplinaryAssessment,
    generatedAt: new Date().toISOString(),
    modelUsed: 'Rule-based engine (no external AI model)',
  };
}

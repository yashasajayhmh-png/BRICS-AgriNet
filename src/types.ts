export type NavigationTab =
  | 'advisory'
  | 'diagnosis'
  | 'copilot'
  | 'federated'
  | 'outbreak'
  | 'architecture';

export interface EpisodicMemoryEvent {
  season: string;
  year: number;
  crop: string;
  observedIssue: string;
  actionTaken: string;
  yieldAchieved: number; // tons/ha
  soilNitrogenDelta: string;
}

export interface AgriCreditProfile {
  creditScore: number; // 0 - 100
  ratingGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  advisoryAdherenceRate: number; // %
  ndviStabilityIndex: number; // 0 - 1.0
  historicalYieldConsistency: number; // %
  microfinanceStatus: 'Pre-Approved' | 'Eligible' | 'Review Required';
  maxMicroLoanUSD: number;
  cropInsuranceTier: string;
}

export interface DigitalMRVRecord {
  carbonSequesteredTonsHa: number;
  carbonCreditEligibleUSD: number;
  nitrogenRunoffReducedPercent: number;
  soilOrganicCarbonIncrease: number; // %
  regenerativePracticesLogged: string[];
  verificationStatus: 'Verified (Sentinel-2 dMRV)' | 'Pending In-Situ Audit';
}

export interface PlotTelemetry {
  id: string;
  name: string;
  country: string;
  flag: string;
  region: string;
  coordinates: { lat: number; lng: number };
  crop: string;
  soilType: string;
  soilPH: number;
  nitrogen: number; // kg/ha or rating
  phosphorus: number;
  potassium: number;
  organicCarbonPercent: number;
  soilMoisture: number; // %
  rainfallForecast7d: number; // mm total
  rainfallDaily: number[]; // 7 days in mm
  tempRange: { min: number; max: number };
  humidityPercent: number;
  ndviCurrent: number; // 0.00 - 1.00
  ndviTrend: number[]; // 6-week trend
  historicalYieldAvg: number; // tons/ha
  episodicMemories?: EpisodicMemoryEvent[];
  creditProfile?: AgriCreditProfile;
  dmrvRecord?: DigitalMRVRecord;
}

export interface CandidateRecommendation {
  id: string;
  title: string;
  summary: string;
  keyFactors: string[];
  inputAdvice: string;
  potentialRisks: string;
}

export interface AdvisoryAgentResponse {
  agent: string;
  telemetryAssessment: string;
  candidateRecommendations: CandidateRecommendation[];
  reasoningSteps: string[];
}

export interface BiophysicalCheckItem {
  module: string;
  verdict: 'PASS' | 'WARNING' | 'FAIL';
  simulatedMetric: string;
  observation: string;
}

export interface SimulationAgentResponse {
  agent: string;
  engineSimulated: string;
  overallVerdict: 'PASSED' | 'MODIFIED_WITH_WARNINGS' | 'FLAGGED_RISK';
  plausibilityScore: number;
  biophysicalChecks: BiophysicalCheckItem[];
  simulationFlags: string[];
  requiredModifications: string;
}

export interface SynthesisAgentResponse {
  agent: string;
  finalAnswerMarkdown: string;
}

export type AgentStepStatus = 'idle' | 'running' | 'completed' | 'error';

export interface MultiAgentState {
  currentStep: number; // 0 = idle, 1 = advisory, 2 = simulation, 3 = synthesis
  advisoryStatus: AgentStepStatus;
  simulationStatus: AgentStepStatus;
  synthesisStatus: AgentStepStatus;
  advisoryData: AdvisoryAgentResponse | null;
  simulationData: SimulationAgentResponse | null;
  synthesisData: SynthesisAgentResponse | null;
  error: string | null;
}

export interface DiagnosisResult {
  identifiedCrop: string;
  conditionName: string;
  scientificName?: string;
  confidenceScore: number;
  severityLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'None';
  visualSymptoms: string[];
  biologicalCause: string;
  immediateRemedies: string[];
  chemicalOptions: string[];
  preventativeMeasures: string[];
  extensionNotes: string;
}

export interface GroundingSource {
  id: string;
  name: string;
  institution: string;
  type: string;
  year: string;
  snippet: string;
}

export interface FarmRecord {
  id: string;
  farmId: string;
  farmerName: string;
  crop: string;
  areaHa: number;
  soilType: string;
  soilPH: number;
  nitrogenAppliedKg: number;
  rainfallMm: number;
  ndviScore: number;
  diseasePresent: boolean;
  yieldKgHa: number;
}

export interface NationSilo {
  id: string;
  country: string;
  flag: string;
  nationalInstitution: string;
  cloudRegion: string;
  records: FarmRecord[];
  localAccuracy: number;
  targetAccuracy: number;
  currentLoss: number;
  weightDeltaVectors: number[];
  differentialPrivacyEpsilon: number;
}

export interface OutbreakReport {
  id: string;
  date: string;
  country: string;
  flag: string;
  region: string;
  crop: string;
  pestDisease: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  sporeDensityIndex: number;
  coordinates: { lat: number; lng: number };
  distanceToBorderKm: number;
  neighboringCountry: string;
  verifiedBy: string;
}

export interface EscalatedTicket {
  id: string;
  timestamp: string;
  farmerName: string;
  farmerPhone: string;
  region: string;
  country: string;
  flag: string;
  crop: string;
  photoUrl: string;
  aiSuggestedCondition: string;
  confidenceScore: number;
  triageReason: string;
  ragCitations: GroundingSource[];
  status: 'PENDING_REVIEW' | 'VERIFIED_BY_AGENT' | 'REJECTED';
  agronomistNotes?: string;
  prescribedTreatment?: string;
}

export interface FederatedRoundResponse {
  roundNumber: number;
  globalAccuracy: number;
  updatedSilos: NationSilo[];
  privacyBudgetConsumedEpsilon: number;
  coordinatorNotes: string;
  nonIIDDivergenceIndex: number;
  sovereignAuditCertificate: string;
}

export interface OutbreakForecastResponse {
  transboundaryRiskLevel: 'MODERATE' | 'HIGH' | 'CRITICAL';
  clusterDetected: boolean;
  clusterCount: number;
  primaryVector: string;
  fourteenDaySpreadPrediction: string;
  atmosphericTransportIndex: number;
  multilateralDirectives: string[];
  bufferZoneActionPlan: string;
  affectedBorderBilateralCorridors: string[];
}

export interface CopilotAssistResponse {
  ticketId: string;
  differentialDiagnosis: string;
  ragCorroboration: string;
  recommendedPrescription: string;
  safetyContraindications: string[];
  fieldVerificationChecklist: string[];
  estimatedYieldRecoveryPct: number;
}

export interface CreditAssessmentResponse {
  plotId: string;
  creditScore: number;
  ratingGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  defaultProbabilityPct: number;
  maxMicroLoanUSD: number;
  carbonCreditsEarnedUSD: number;
  justification: string;
  dMRVCertificateHash: string;
}

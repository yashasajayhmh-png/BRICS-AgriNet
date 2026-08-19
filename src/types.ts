export type NavigationTab =
  | 'landing'
  | 'advisory'
  | 'diagnosis'
  | 'satellite_soil'
  | 'farm_profile'
  | 'copilot'
  | 'fpo_marketplace'
  | 'federated'
  | 'outbreak'
  | 'governance_api'
  | 'knowledge'
  | 'architecture';

export type UserRole = 'farmer' | 'extension_officer' | 'fpo_manager' | 'research_admin' | 'auditor';

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'mr'
  | 'te'
  | 'pt'
  | 'es'
  | 'sw'
  | 'zh'
  | 'ar'
  | 'am'
  | 'ru';

export interface FarmerProfile {
  id: string;
  farmerName: string;
  phoneOrEmail: string;
  country: string;
  flag: string;
  region: string;
  cropFocus: string;
  farmSizeHa: number;
  plotId: string;
  role: UserRole;
  language?: SupportedLanguage;
  createdAt?: string;
  avatarUrl?: string;
}

export interface RegenerativePractice {
  id: string;
  name: string;
  category: 'Cover Crop' | 'Biochar' | 'Crop Rotation' | 'Zero-Till' | 'Agroforestry' | 'Bio-NPK';
  description: string;
  carbonSequestrationTonsHaYear: number;
  nitrogenFixationKgHa: number;
  soilMicrobialBiomassDeltaPct: number;
  biodiversityScoreGain: number; // 0 - 100
  recommendedCrops: string[];
  climateZone: string;
}

export interface SoilHealthTelemetry {
  plotId: string;
  soilPH: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  organicCarbonSOCPct: number;
  electroConductivityEC: number; // dS/m
  zincPpm: number;
  boronPpm: number;
  ironPpm: number;
  cationExchangeCapacityCEC: number; // meq/100g
  soilDegradationIndex: number; // 0 (pristine) - 100 (heavily degraded)
  soilTexture: 'Clay Loam' | 'Sandy Loam' | 'Black Cotton Vertisol' | 'Laterite' | 'Alluvial';
  remediationPlan: string[];
  lastTestedDate: string;
}

export interface SatelliteSpectralData {
  plotId: string;
  satelliteSensor: 'Sentinel-2 MSI' | 'Landsat-9 OLI' | 'PlanetScope 3m';
  ndviCurrent: number;
  ndviTrend: number[]; // 6-week values
  ndreRedEdgeCurrent: number; // Red Edge Chlorophyll Index
  soilMoistureIndexSMI: number; // 0.00 - 1.00
  landSurfaceTempCelsius: number;
  enhancedVegetationIndexEVI: number;
  cloudCoveragePercent: number;
  tileId: string;
  lastPassDate: string;
}

export interface WeatherForecastAlert {
  day: string;
  date: string;
  tempMinC: number;
  tempMaxC: number;
  rainfallMm: number;
  humidityPct: number;
  windSpeedKmh: number;
  solarRadiationMjM2: number;
  evapotranspirationET0: number; // mm/day
  growingDegreeDaysGDD: number;
  droughtRiskIndex: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  frostAlert: boolean;
  pestSporeRiskAlert: boolean;
  sprayRecommendation: 'Favorable Spray Window' | 'Avoid Spraying (High Wind/Rain)' | 'Urgent Preventive Bio-Spray';
}

export interface YieldPredictionResult {
  plotId: string;
  crop: string;
  baselineHistoricalYieldTonsHa: number;
  aiPredictedYieldTonsHa: number;
  optimisticYieldTonsHa: number;
  pessimisticYieldTonsHa: number;
  confidenceScorePct: number;
  projectedHarvestDate: string;
  limitingFactors: string[];
  whatIfSensitivity: {
    nitrogenBoostPlus20Pct: number;
    additionalIrrigationPlus30Mm: number;
    delayPlantingMinus10Days: number;
  };
}

export interface FarmerFeedbackEntry {
  id: string;
  targetId: string; // advisory or diagnosis id
  farmerId: string;
  farmerName: string;
  plotName: string;
  ratingScore: number; // 1 - 5
  isConfirmedAccurate: boolean;
  fieldOutcomeNote: string;
  actualHarvestYieldTonsHa?: number;
  timestamp: string;
  verifiedByKVK?: boolean;
}

export interface FarmFieldProfile {
  id: string;
  farmerId: string;
  fieldName: string;
  boundaryGeoJson: {
    type: 'Polygon';
    coordinates: [number, number][];
  };
  areaHa: number;
  soilTexture: string;
  irrigationType: 'Drip Micro-irrigation' | 'Solar Canal' | 'Sprinkler' | 'Rainfed Lowland';
  cropHistory: { season: string; crop: string; yieldTons: number }[];
  fieldHealthScore: number;
  hasSoilSensorConnected: boolean;
}

export interface PushAlertNotification {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'weather' | 'pest' | 'market' | 'advisory';
  read: boolean;
  actionTab?: NavigationTab;
}

export interface DataSourceConnector {
  id: string;
  name: string;
  category: 'Satellite Imagery' | 'Weather & Agrometeorology' | 'Soil Data' | 'National Agronomy Repository';
  institution: string;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'OFFLINE';
  latencyMs: number;
  lastSyncTimestamp: string;
  recordsIngested24h: number;
  endpointUrl: string;
}

export interface ModelMonitoringTelemetry {
  modelId: string;
  modelName: string;
  architecture: string;
  currentF1Score: number;
  driftMetricPSI: number; // Population Stability Index
  validationLossHistory: number[];
  lastRetrainedDate: string;
  dpEpsilonConsumed: number;
  federatedNodesOnline: number;
  trainingStatus: 'READY' | 'TRAINING' | 'EVALUATING';
}

export interface AgronomistAdvisoryTemplate {
  id: string;
  title: string;
  crop: string;
  targetPestOrNutrient: string;
  region: string;
  recommendedSteps: string[];
  organicAlternative: string;
  chemicalAlternative: string;
  authorAgronomist: string;
  approvalStatus: 'APPROVED' | 'DRAFT' | 'ARCHIVED';
  updatedAt: string;
}

export interface OpenApiEndpointDoc {
  path: string;
  method: 'GET' | 'POST' | 'PATCH';
  summary: string;
  description: string;
  queryParams?: string[];
  sampleRequestJson?: string;
  sampleResponseJson: string;
}

export interface BricsDataStandard {
  schemaName: string;
  standardBody: 'AgGateway ADAPT' | 'ICASA Standard' | 'Darwin Core Agronomy' | 'ISO 19156';
  description: string;
  sampleJson: string;
  fieldsCount: number;
}

export interface CrossBorderModelRegistry {
  modelId: string;
  name: string;
  version: string;
  hostSilo: string;
  country: string;
  flag: string;
  sha256Checksum: string;
  parametersMillion: number;
  dpBudgetEpsilon: number;
  verifiedByConsortium: boolean;
  lastUpdated: string;
}

export interface FarmerConsentSettings {
  shareGpsForAdvisories: boolean;
  shareSoilTestAnonymously: boolean;
  shareCropImageryForResearch: boolean;
  allowFederatedGradients: boolean;
  optInSmsAlerts: boolean;
  lastUpdated: string;
}

export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  actionType: 'DATA_ACCESS' | 'CROSS_BORDER_EXCHANGE' | 'MODEL_INFERENCE' | 'CONSENT_CHANGE' | 'EXPORT';
  resourceTarget: string;
  cryptographicHash: string;
  status: 'SUCCESS' | 'FLAGGED';
}

export interface FpoCooperative {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  memberFarmerCount: number;
  totalHa: number;
  primaryCrops: string[];
  collectiveYieldForecastTons: number;
  bulkOrderDiscountsActive: number;
  aggregateCreditRating: string;
}

export interface MarketplaceItem {
  id: string;
  type: 'input_supplier' | 'insurance' | 'buyer';
  name: string;
  provider: string;
  rating: number;
  priceOrRate: string;
  description: string;
  certifiedOrganicOrGovt: boolean;
  contactOrPurchaseAction: string;
  country: string;
  flag: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Regenerative Farming' | 'Pest Control' | 'Soil Management' | 'Climate Resilience';
  readTimeMinutes: number;
  languagesAvailable: string[];
  summary: string;
  contentMarkdown: string;
  practicalActionChecklist: string[];
}

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

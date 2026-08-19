import {
  OpenApiEndpointDoc,
  BricsDataStandard,
  CrossBorderModelRegistry,
  FarmerConsentSettings,
  ComplianceAuditLog,
  DataSourceConnector,
  ModelMonitoringTelemetry,
  AgronomistAdvisoryTemplate,
} from '../types';

export const OPEN_API_DOCS: OpenApiEndpointDoc[] = [
  {
    path: '/api/v1/advisories/evaluate',
    method: 'POST',
    summary: 'Evaluate Sequential 3-Stage Agronomic Advisory',
    description: 'Executes the sequential Gemini 3.7 Flash agronomic pipeline with biophysical DSSAT simulation constraints and dialect synthesis.',
    sampleRequestJson: JSON.stringify(
      {
        farmerQuery: 'Yellowing on lower leaves during grain filling',
        plotId: 'in-punjab-01',
        crop: 'Winter Wheat',
        language: 'hi',
        inSituTelemetry: { soilMoisture: 54, soilPH: 7.4, nitrogen: 220 },
      },
      null,
      2
    ),
    sampleResponseJson: JSON.stringify(
      {
        success: true,
        advisory: {
          recommendation: 'Apply foliar Zinc Sulfate (0.5%) + Urea (2%) spray',
          biophysicalCheck: 'PASSED (APSIM v7.1 moisture plausibility = 94%)',
          dialectSteps: ['Step 1: Mix 1kg ZnSO4 in 200L water per acre', 'Step 2: Spray during calm morning window'],
        },
      },
      null,
      2
    ),
  },
  {
    path: '/api/v1/telemetry/plot/:plotId',
    method: 'GET',
    summary: 'Retrieve In-Situ Soil & Satellite Spectral Telemetry',
    description: 'Fetches real-time Sentinel-2 NDVI, soil moisture index, NPK sensor records, and 7-day microclimate forecasts for an authenticated parcel.',
    queryParams: ['includeHistoricalTrend=true', 'includeEpisodicMemory=true'],
    sampleResponseJson: JSON.stringify(
      {
        plotId: 'in-punjab-01',
        country: 'India',
        ndviCurrent: 0.68,
        soilPH: 7.4,
        organicCarbonPct: 0.58,
        satellitePassDate: '2026-08-18T10:45:00Z',
        sensorHealth: 'OPTIMAL',
      },
      null,
      2
    ),
  },
  {
    path: '/api/v1/outbreaks/transboundary-alerts',
    method: 'GET',
    summary: 'Query Bilateral Airborne Spore Dispersion Alerts',
    description: 'Calculates spatial border clusters and 14-day atmospheric trajectory forecasts for yellow rust, desert locusts, and fall armyworm.',
    queryParams: ['country=India', 'severityMin=Moderate'],
    sampleResponseJson: JSON.stringify(
      {
        activeClusters: 2,
        transboundaryRiskLevel: 'HIGH',
        sporeDispersionVector: 'Indo-Gangetic West-to-East Jet (18 km/h)',
        bilateralCorridors: ['India-Pakistan Punjab Corridor', 'Brazil-Paraguay Parana Corridor'],
      },
      null,
      2
    ),
  },
  {
    path: '/api/v1/federated/gradients/exchange',
    method: 'POST',
    summary: 'Cryptographic Gradient Vector Sovereign Submission',
    description: 'Allows accredited sovereign research silos (ICAR, Embrapa, ARC, CAAS) to submit DP-FedAvg gradient deltas with zero raw farmer data leakage.',
    sampleRequestJson: JSON.stringify(
      {
        siloId: 'icar-india-silo',
        roundId: 14,
        gradientVectorChecksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        differentialPrivacyEpsilon: 0.5,
      },
      null,
      2
    ),
    sampleResponseJson: JSON.stringify(
      {
        status: 'ACCEPTED_INTO_FEDERATED_AGGREGATION',
        complianceProof: 'SOVEREIGN_BRICS_DP_VERIFIED_0.5',
      },
      null,
      2
    ),
  },
];

export const BRICS_DATA_STANDARDS: BricsDataStandard[] = [
  {
    schemaName: 'AgGateway ADAPT / ICASA Interoperability Schema v4.2',
    standardBody: 'AgGateway ADAPT',
    description: 'Harmonizes equipment telemetry (ISOBUS 11783), soil laboratory assays, and geospatial field boundary GeoJSON across BRICS agricultural ministries.',
    fieldsCount: 48,
    sampleJson: JSON.stringify(
      {
        "$schema": "https://standards.brics-agrinet.org/schemas/v4/adapt-field-profile.json",
        "farmerUniqueId": "FARM-IN-PB-88219",
        "spatialPolygon": { "type": "Polygon", "coordinates": [[[75.857, 30.901], [75.859, 30.901], [75.859, 30.899], [75.857, 30.899], [75.857, 30.901]]] },
        "soilProfile": { "texture": "Alluvial Loam", "ph": 7.4, "socPercent": 0.58 },
        "complianceSovereignty": "NON_EXPORTABLE_IN_SITU_PROTECTED"
      },
      null,
      2
    ),
  },
  {
    schemaName: 'Darwin Core Agricultural Biodiversity & Pest Taxonomy',
    standardBody: 'Darwin Core Agronomy',
    description: 'Standardized phytosanitary nomenclature for foliar pathogens, transboundary airborne spore reporting, and biological biocontrol cataloging.',
    fieldsCount: 32,
    sampleJson: JSON.stringify(
      {
        "$schema": "https://standards.brics-agrinet.org/schemas/v4/dwc-pathogen.json",
        "scientificName": "Puccinia striiformis f. sp. tritici",
        "vernacularName": "Wheat Stripe / Yellow Rust",
        "pathogenClass": "Basidiomycota",
        "quarantineStatus": "REGULATED_TRANSBOUNDARY_VECTOR",
        "sporeDensityIndexThreshold": 75.0
      },
      null,
      2
    ),
  },
  {
    schemaName: 'ISO 19156 / OGC Observations & In-Situ Sensor Web',
    standardBody: 'ISO 19156',
    description: 'Defines the structural payload for IoT LoRaWAN soil moisture probes, automated weather stations (AWS), and Sentinel-2 spectral band reflectance ratios.',
    fieldsCount: 26,
    sampleJson: JSON.stringify(
      {
        "observationType": "SoilMoistureCapacitiveVolumetric",
        "phenomenonTime": "2026-08-19T11:00:00Z",
        "resultValue": 54.2,
        "resultUnit": "PERCENT_VOLUMETRIC",
        "sensorCalibrationOffset": -0.4
      },
      null,
      2
    ),
  },
];

export const CROSS_BORDER_MODELS: CrossBorderModelRegistry[] = [
  {
    modelId: 'brics-agri-gemini-multimodal-v3.7',
    name: 'Gemini 3.7 Flash Foliar Pathogen Multi-Task Vision',
    version: '3.7.2',
    hostSilo: 'BRICS Consortium Joint Registry (Cloud Run Multi-Region)',
    country: 'Consortium',
    flag: '🌐',
    sha256Checksum: '8f4c2e1b9a7d3c5e8b6a4f2d1c9e7b5a3f1d9c7b5e3a1f9d7c5b3a1e9f7d5c3b',
    parametersMillion: 8200,
    dpBudgetEpsilon: 0.5,
    verifiedByConsortium: true,
    lastUpdated: '2026-08-18',
  },
  {
    modelId: 'icar-wheat-rust-cnn-v4',
    name: 'ICAR Stripe Rust Sub-Species Micro-Classifier',
    version: '4.1.0',
    hostSilo: 'ICAR National Agricultural Informatics Centre (New Delhi)',
    country: 'India',
    flag: '🇮🇳',
    sha256Checksum: '4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    parametersMillion: 145,
    dpBudgetEpsilon: 0.35,
    verifiedByConsortium: true,
    lastUpdated: '2026-08-12',
  },
  {
    modelId: 'embrapa-cerrado-soybean-transformer',
    name: 'Embrapa Cerrado Soybean Yield Biophysical Transformer',
    version: '2.4.1',
    hostSilo: 'Embrapa Digital Agriculture (Campinas, SP)',
    country: 'Brazil',
    flag: '🇧🇷',
    sha256Checksum: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    parametersMillion: 320,
    dpBudgetEpsilon: 0.45,
    verifiedByConsortium: true,
    lastUpdated: '2026-08-15',
  },
  {
    modelId: 'arc-maize-drought-dssat-nn',
    name: 'ARC Highveld Maize Drought Sensitivity Neural Surrogate',
    version: '1.9.0',
    hostSilo: 'Agricultural Research Council (Pretoria)',
    country: 'South Africa',
    flag: '🇿🇦',
    sha256Checksum: '2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
    parametersMillion: 88,
    dpBudgetEpsilon: 0.30,
    verifiedByConsortium: true,
    lastUpdated: '2026-08-10',
  },
];

export const INITIAL_CONSENT_SETTINGS: FarmerConsentSettings = {
  shareGpsForAdvisories: true,
  shareSoilTestAnonymously: true,
  shareCropImageryForResearch: true,
  allowFederatedGradients: true,
  optInSmsAlerts: true,
  lastUpdated: '2026-08-19',
};

export const INITIAL_AUDIT_LOGS: ComplianceAuditLog[] = [
  {
    id: 'log-8841',
    timestamp: '2026-08-19T11:15:22Z',
    actorId: 'farmer_rajesh_punjab',
    actorRole: 'Smallholder Farmer',
    actionType: 'MODEL_INFERENCE',
    resourceTarget: 'Gemini 3.7 Flash Sequential Advisory (Plot #in-punjab-01)',
    cryptographicHash: 'sha256:7b419c8f2e...',
    status: 'SUCCESS',
  },
  {
    id: 'log-8840',
    timestamp: '2026-08-19T10:48:10Z',
    actorId: 'ext_officer_anita_kvk',
    actorRole: 'Village Extension Officer',
    actionType: 'DATA_ACCESS',
    resourceTarget: 'Escalated Phytosanitary Ticket #TICK-8821',
    cryptographicHash: 'sha256:3a910d5e8c...',
    status: 'SUCCESS',
  },
  {
    id: 'log-8839',
    timestamp: '2026-08-19T09:30:00Z',
    actorId: 'icar_national_silo_coordinator',
    actorRole: 'Sovereign Research Admin',
    actionType: 'CROSS_BORDER_EXCHANGE',
    resourceTarget: 'DP-FedAvg Gradient Vector Round #14 (Epsilon=0.5)',
    cryptographicHash: 'sha256:e3b0c44298...',
    status: 'SUCCESS',
  },
  {
    id: 'log-8838',
    timestamp: '2026-08-19T08:12:44Z',
    actorId: 'policy_auditor_brics_secretariat',
    actorRole: 'Compliance & Policy Auditor',
    actionType: 'CONSENT_CHANGE',
    resourceTarget: 'Data Sovereignty Zero-Leakage Export Audit Verification',
    cryptographicHash: 'sha256:91c2e4a8b7...',
    status: 'SUCCESS',
  },
];

export const DATA_SOURCE_CONNECTORS: DataSourceConnector[] = [
  {
    id: 'copernicus-sentinel2',
    name: 'Copernicus Sentinel-2 MSI Multi-Spectral API',
    category: 'Satellite Imagery',
    institution: 'European Space Agency (ESA) & BRICS Space Working Group',
    status: 'CONNECTED',
    latencyMs: 142,
    lastSyncTimestamp: '2026-08-19T11:00:00Z',
    recordsIngested24h: 18450,
    endpointUrl: 'https://dataspace.copernicus.eu/odata/v1/Products',
  },
  {
    id: 'era5-agrometeorology',
    name: 'ECMWF ERA5 & NASA POWER Agrometeorology Hub',
    category: 'Weather & Agrometeorology',
    institution: 'NASA Earth Science & ECMWF Agro-Hub',
    status: 'CONNECTED',
    latencyMs: 98,
    lastSyncTimestamp: '2026-08-19T11:15:00Z',
    recordsIngested24h: 342000,
    endpointUrl: 'https://power.larc.nasa.gov/api/temporal/hourly/point',
  },
  {
    id: 'soilgrids-isric',
    name: 'ISRIC SoilGrids 250m Global High-Resolution Assays',
    category: 'Soil Data',
    institution: 'International Soil Reference and Information Centre',
    status: 'CONNECTED',
    latencyMs: 210,
    lastSyncTimestamp: '2026-08-19T08:30:00Z',
    recordsIngested24h: 8900,
    endpointUrl: 'https://rest.isric.org/soilgrids/v2.0/properties/query',
  },
  {
    id: 'icar-agrisnet',
    name: 'ICAR-KVK National Agronomic Advisory Repository',
    category: 'National Agronomy Repository',
    institution: 'Indian Council of Agricultural Research (ICAR)',
    status: 'CONNECTED',
    latencyMs: 85,
    lastSyncTimestamp: '2026-08-19T10:45:00Z',
    recordsIngested24h: 12500,
    endpointUrl: 'https://icar.gov.in/api/v2/krishi-vigyan-kendra',
  },
  {
    id: 'embrapa-geoinfra',
    name: 'Embrapa GeoAgro Soil & Pasture Spatial Service',
    category: 'National Agronomy Repository',
    institution: 'Empresa Brasileira de Pesquisa Agropecuária (Embrapa)',
    status: 'CONNECTED',
    latencyMs: 165,
    lastSyncTimestamp: '2026-08-19T10:30:00Z',
    recordsIngested24h: 15400,
    endpointUrl: 'https://geoinfra.embrapa.br/geoserver/agro/wms',
  },
];

export const MODEL_MONITORING_METRICS: ModelMonitoringTelemetry[] = [
  {
    modelId: 'multimodal-vision-pathogen-v3',
    modelName: 'Foliar Multimodal Vision Classifier',
    architecture: 'Gemini 3.7 Flash + Regional Few-Shot Adapters',
    currentF1Score: 0.942,
    driftMetricPSI: 0.048, // Low drift (<0.10)
    validationLossHistory: [0.38, 0.29, 0.22, 0.18, 0.15, 0.14],
    lastRetrainedDate: '2026-08-18',
    dpEpsilonConsumed: 0.42,
    federatedNodesOnline: 5,
    trainingStatus: 'READY',
  },
  {
    modelId: 'biophysical-yield-dssat-v2',
    modelName: 'Biophysical Yield & Stress Predictor',
    architecture: 'APSIM / DSSAT Biophysical Surrogate Transformer',
    currentF1Score: 0.895,
    driftMetricPSI: 0.082,
    validationLossHistory: [0.45, 0.36, 0.28, 0.24, 0.21, 0.19],
    lastRetrainedDate: '2026-08-16',
    dpEpsilonConsumed: 0.38,
    federatedNodesOnline: 5,
    trainingStatus: 'READY',
  },
];

export const ADVISORY_TEMPLATES: AgronomistAdvisoryTemplate[] = [
  {
    id: 'tmpl-wheat-rust-protocol',
    title: 'Wheat Yellow / Stripe Rust First-Incursion Protocol',
    crop: 'Wheat',
    targetPestOrNutrient: 'Puccinia striiformis (Yellow Rust)',
    region: 'Indo-Gangetic & Central Asian Highlands',
    recommendedSteps: [
      'Isolate affected foci within 5-meter quarantine buffer ring immediately.',
      'Apply Propiconazole 25% EC @ 1 ml/L or Tebuconazole 25.9% EC @ 1.25 ml/L water.',
      'Avoid high-dose nitrogen top-dressing which exacerbates fungal sporulation.',
      'Re-inspect in 7 days; log field outcome to BRICS Outbreak Radar.',
    ],
    organicAlternative: 'Foliar spray with Trichoderma viride bio-fungicide (5g/L) + fermented buttermilk spray.',
    chemicalAlternative: 'Propiconazole 25% EC (Tilt / Bumper) @ 500 ml in 500L water/hectare.',
    authorAgronomist: 'Dr. Gurpreet Singh (PAU / ICAR Senior Mycologist)',
    approvalStatus: 'APPROVED',
    updatedAt: '2026-08-15',
  },
  {
    id: 'tmpl-soybean-rust-cerrado',
    title: 'Cerrado Asian Soybean Rust Preventive Anti-Spore Shield',
    crop: 'Soybean',
    targetPestOrNutrient: 'Phakopsora pachyrhizi (Asian Soybean Rust)',
    region: 'Cerrado (Mato Grosso / Goiás)',
    recommendedSteps: [
      'Initiate spray strictly at R1 (flowering onset) when regional spore index > 40.',
      'Utilize multisite protective fungicide (Mancozeb 75% WG) tank-mixed with systemic SDHI triazole.',
      'Calibrate tractor boom nozzle pressure for maximum canopy sub-leaf penetration.',
    ],
    organicAlternative: 'Bacillus subtilis QST 713 bio-inoculant + cold-pressed neem kernel extract (5%).',
    chemicalAlternative: 'Trifloxystrobin + Prothioconazole @ 0.5 L/ha + Mancozeb @ 1.5 kg/ha.',
    authorAgronomist: 'Dra. Camila Silveira (Embrapa Soja Specialist)',
    approvalStatus: 'APPROVED',
    updatedAt: '2026-08-14',
  },
];

import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";
import { INITIAL_NATION_SILOS, ESCALATED_TICKETS, OUTBREAK_REPORTS, BRICS_PLOTS } from "../src/data/mockData";
import { EscalatedTicket, OutbreakReport, PlotTelemetry, DiagnosisResult } from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "agrinet.sqlite");

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
    initSchemaAndSeed(dbInstance);
    saveDatabase();
  }

  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Failed to persist SQLite database to disk:", err);
  }
}

function initSchemaAndSeed(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS diagnosis_history (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      image_data TEXT,
      identified_crop TEXT,
      condition_name TEXT,
      scientific_name TEXT,
      confidence_score REAL,
      severity_level TEXT,
      visual_symptoms TEXT,
      biological_cause TEXT,
      immediate_remedies TEXT,
      chemical_options TEXT,
      preventative_measures TEXT,
      extension_notes TEXT,
      region TEXT
    );

    CREATE TABLE IF NOT EXISTS escalated_tickets (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      farmer_phone TEXT,
      region TEXT,
      country TEXT,
      flag TEXT,
      crop TEXT,
      photo_url TEXT,
      ai_suggested_condition TEXT,
      confidence_score REAL,
      triage_reason TEXT,
      rag_citations TEXT,
      status TEXT,
      agronomist_notes TEXT,
      prescribed_treatment TEXT
    );

    CREATE TABLE IF NOT EXISTS outbreak_reports (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      country TEXT NOT NULL,
      flag TEXT,
      region TEXT,
      crop TEXT,
      pest_disease TEXT,
      severity TEXT,
      spore_density_index REAL,
      lat REAL,
      lng REAL,
      distance_to_border_km REAL,
      neighboring_country TEXT,
      verified_by TEXT
    );

    CREATE TABLE IF NOT EXISTS plot_telemetry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT,
      flag TEXT,
      region TEXT,
      lat REAL,
      lng REAL,
      crop TEXT,
      soil_type TEXT,
      soil_ph REAL,
      nitrogen REAL,
      phosphorus REAL,
      potassium REAL,
      organic_carbon_percent REAL,
      soil_moisture REAL,
      rainfall_forecast_7d REAL,
      rainfall_daily TEXT,
      temp_min REAL,
      temp_max REAL,
      humidity_percent REAL,
      ndvi_current REAL,
      ndvi_trend TEXT,
      historical_yield_avg REAL,
      episodic_memories TEXT,
      credit_profile TEXT,
      dmrv_record TEXT
    );

    CREATE TABLE IF NOT EXISTS federated_rounds (
      round_number INTEGER PRIMARY KEY,
      timestamp TEXT NOT NULL,
      global_accuracy REAL,
      non_iid_divergence REAL,
      epsilon_used REAL,
      aggregation_method TEXT,
      coordinator_notes TEXT,
      sovereign_certificate TEXT,
      silos_state TEXT
    );
  `);

  // Seed initial tickets
  for (const t of ESCALATED_TICKETS) {
    db.run(
      `INSERT OR IGNORE INTO escalated_tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.timestamp,
        t.farmerName,
        t.farmerPhone,
        t.region,
        t.country,
        t.flag,
        t.crop,
        t.photoUrl,
        t.aiSuggestedCondition,
        t.confidenceScore,
        t.triageReason,
        JSON.stringify(t.ragCitations || []),
        t.status,
        t.agronomistNotes || "",
        t.prescribedTreatment || "",
      ]
    );
  }

  // Seed initial outbreak reports
  for (const o of OUTBREAK_REPORTS) {
    db.run(
      `INSERT OR IGNORE INTO outbreak_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id,
        o.date,
        o.country,
        o.flag,
        o.region,
        o.crop,
        o.pestDisease,
        o.severity,
        o.sporeDensityIndex,
        o.coordinates.lat,
        o.coordinates.lng,
        o.distanceToBorderKm,
        o.neighboringCountry,
        o.verifiedBy,
      ]
    );
  }

  // Seed initial plots
  for (const p of BRICS_PLOTS) {
    db.run(
      `INSERT OR IGNORE INTO plot_telemetry VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.country,
        p.flag,
        p.region,
        p.coordinates.lat,
        p.coordinates.lng,
        p.crop,
        p.soilType,
        p.soilPH,
        p.nitrogen,
        p.phosphorus,
        p.potassium,
        p.organicCarbonPercent,
        p.soilMoisture,
        p.rainfallForecast7d,
        JSON.stringify(p.rainfallDaily || []),
        p.tempRange.min,
        p.tempRange.max,
        p.humidityPercent,
        p.ndviCurrent,
        JSON.stringify(p.ndviTrend || []),
        p.historicalYieldAvg,
        JSON.stringify(p.episodicMemories || []),
        JSON.stringify(p.creditProfile || {}),
        JSON.stringify(p.dmrvRecord || {}),
      ]
    );
  }

  // Seed round 0 federated state
  db.run(
    `INSERT OR IGNORE INTO federated_rounds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      0,
      new Date().toISOString(),
      75.4,
      0.28,
      0.5,
      "DP-FedAvg",
      "Federated Aggregator standing by for Round #1 initialization across sovereign nodes (ICAR India & Embrapa Brazil).",
      "BRICS-FED-SECURE-INIT-INDORE-CONVENTION-2026",
      JSON.stringify(INITIAL_NATION_SILOS),
    ]
  );
}

// ----------------------------------------------------
// DATABASE ACCESS HELPER FUNCTIONS
// ----------------------------------------------------

export async function dbGetDiagnosisHistory(): Promise<any[]> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM diagnosis_history ORDER BY created_at DESC LIMIT 50");
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      createdAt: row.created_at,
      imageData: row.image_data,
      identifiedCrop: row.identified_crop,
      conditionName: row.condition_name,
      scientificName: row.scientific_name,
      confidenceScore: row.confidence_score,
      severityLevel: row.severity_level,
      visualSymptoms: JSON.parse((row.visual_symptoms as string) || "[]"),
      biologicalCause: row.biological_cause,
      immediateRemedies: JSON.parse((row.immediate_remedies as string) || "[]"),
      chemicalOptions: JSON.parse((row.chemical_options as string) || "[]"),
      preventativeMeasures: JSON.parse((row.preventative_measures as string) || "[]"),
      extensionNotes: row.extension_notes,
      region: row.region,
    });
  }
  stmt.free();
  return results;
}

export async function dbSaveDiagnosis(diag: any, imageData: string, region: string): Promise<any> {
  const db = await getDatabase();
  const id = `diag-${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO diagnosis_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      createdAt,
      imageData?.startsWith("data:") ? imageData : imageData?.slice(0, 500),
      diag.identifiedCrop,
      diag.conditionName,
      diag.scientificName || "",
      diag.confidenceScore,
      diag.severityLevel,
      JSON.stringify(diag.visualSymptoms || []),
      diag.biologicalCause,
      JSON.stringify(diag.immediateRemedies || []),
      JSON.stringify(diag.chemicalOptions || []),
      JSON.stringify(diag.preventativeMeasures || []),
      diag.extensionNotes,
      region,
    ]
  );
  saveDatabase();

  // If confidence score is below 70%, automatically create an escalated ticket in SQLite!
  if (diag.confidenceScore < 70) {
    const ticketId = `esc-${Date.now()}`;
    db.run(
      `INSERT INTO escalated_tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        "Just now",
        "Field Producer (App Upload)",
        "+91 98231-XXXXX",
        region,
        region.includes("India") ? "India" : region.includes("Brazil") ? "Brazil" : "South Africa",
        region.includes("India") ? "🇮🇳" : region.includes("Brazil") ? "🇧🇷" : "🇿🇦",
        diag.identifiedCrop,
        imageData?.startsWith("data:") ? imageData : imageData || "",
        diag.conditionName,
        diag.confidenceScore,
        `Auto-escalated by AI Sentinel due to ambiguous diagnostic confidence (${diag.confidenceScore}% < 70%). Immediate extension triage required.`,
        JSON.stringify([
          {
            id: "RAG-ICAR-01",
            name: "ICAR Crop Pathology Manual (2025)",
            institution: "ICAR-IARI",
            type: "Phytosanitary Standard",
            year: "2025",
            snippet: "Early chlorotic symptoms must be differentiated from micronutrient deficiencies via 20x pocket field lens examination.",
          },
        ]),
        "PENDING_REVIEW",
        "",
        "",
      ]
    );
    saveDatabase();
  }

  return { id, createdAt, ...diag };
}

export async function dbGetEscalatedTickets(): Promise<EscalatedTicket[]> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM escalated_tickets ORDER BY id DESC");
  const results: EscalatedTicket[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as string,
      timestamp: row.timestamp as string,
      farmerName: row.farmer_name as string,
      farmerPhone: (row.farmer_phone as string) || "",
      region: row.region as string,
      country: row.country as string,
      flag: row.flag as string,
      crop: row.crop as string,
      photoUrl: row.photo_url as string,
      aiSuggestedCondition: row.ai_suggested_condition as string,
      confidenceScore: row.confidence_score as number,
      triageReason: row.triage_reason as string,
      ragCitations: JSON.parse((row.rag_citations as string) || "[]"),
      status: row.status as any,
      agronomistNotes: (row.agronomist_notes as string) || "",
      prescribedTreatment: (row.prescribed_treatment as string) || "",
    });
  }
  stmt.free();
  return results;
}

export async function dbUpdateTicketStatus(
  id: string,
  status: "PENDING_REVIEW" | "VERIFIED_BY_AGENT" | "REJECTED",
  agronomistNotes?: string,
  prescribedTreatment?: string
): Promise<void> {
  const db = await getDatabase();
  db.run(
    `UPDATE escalated_tickets SET status = ?, agronomist_notes = ?, prescribed_treatment = ? WHERE id = ?`,
    [status, agronomistNotes || "", prescribedTreatment || "", id]
  );
  saveDatabase();
}

export async function dbGetOutbreakReports(): Promise<OutbreakReport[]> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM outbreak_reports ORDER BY id DESC");
  const results: OutbreakReport[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as string,
      date: row.date as string,
      country: row.country as string,
      flag: row.flag as string,
      region: row.region as string,
      crop: row.crop as string,
      pestDisease: row.pest_disease as string,
      severity: row.severity as any,
      sporeDensityIndex: row.spore_density_index as number,
      coordinates: { lat: row.lat as number, lng: row.lng as number },
      distanceToBorderKm: row.distance_to_border_km as number,
      neighboringCountry: row.neighboring_country as string,
      verifiedBy: row.verified_by as string,
    });
  }
  stmt.free();
  return results;
}

export async function dbSaveOutbreakReport(rep: OutbreakReport): Promise<OutbreakReport> {
  const db = await getDatabase();
  db.run(
    `INSERT OR REPLACE INTO outbreak_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      rep.id,
      rep.date,
      rep.country,
      rep.flag,
      rep.region,
      rep.crop,
      rep.pestDisease,
      rep.severity,
      rep.sporeDensityIndex,
      rep.coordinates.lat,
      rep.coordinates.lng,
      rep.distanceToBorderKm,
      rep.neighboringCountry,
      rep.verifiedBy,
    ]
  );
  saveDatabase();
  return rep;
}

export async function dbGetPlotsTelemetry(): Promise<PlotTelemetry[]> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM plot_telemetry ORDER BY id ASC");
  const results: PlotTelemetry[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as string,
      name: row.name as string,
      country: row.country as string,
      flag: row.flag as string,
      region: row.region as string,
      coordinates: { lat: row.lat as number, lng: row.lng as number },
      crop: row.crop as string,
      soilType: row.soil_type as string,
      soilPH: row.soil_ph as number,
      nitrogen: row.nitrogen as number,
      phosphorus: row.phosphorus as number,
      potassium: row.potassium as number,
      organicCarbonPercent: row.organic_carbon_percent as number,
      soilMoisture: row.soil_moisture as number,
      rainfallForecast7d: row.rainfall_forecast_7d as number,
      rainfallDaily: JSON.parse((row.rainfall_daily as string) || "[]"),
      tempRange: { min: row.temp_min as number, max: row.temp_max as number },
      humidityPercent: row.humidity_percent as number,
      ndviCurrent: row.ndvi_current as number,
      ndviTrend: JSON.parse((row.ndvi_trend as string) || "[]"),
      historicalYieldAvg: row.historical_yield_avg as number,
      episodicMemories: JSON.parse((row.episodic_memories as string) || "[]"),
      creditProfile: JSON.parse((row.credit_profile as string) || "{}"),
      dmrvRecord: JSON.parse((row.dmrv_record as string) || "{}"),
    });
  }
  stmt.free();
  return results;
}

export async function dbSavePlotTelemetry(plot: PlotTelemetry): Promise<PlotTelemetry> {
  const db = await getDatabase();
  db.run(
    `INSERT OR REPLACE INTO plot_telemetry VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plot.id,
      plot.name,
      plot.country,
      plot.flag,
      plot.region,
      plot.coordinates.lat,
      plot.coordinates.lng,
      plot.crop,
      plot.soilType,
      plot.soilPH,
      plot.nitrogen,
      plot.phosphorus,
      plot.potassium,
      plot.organicCarbonPercent,
      plot.soilMoisture,
      plot.rainfallForecast7d,
      JSON.stringify(plot.rainfallDaily || []),
      plot.tempRange.min,
      plot.tempRange.max,
      plot.humidityPercent,
      plot.ndviCurrent,
      JSON.stringify(plot.ndviTrend || []),
      plot.historicalYieldAvg,
      JSON.stringify(plot.episodicMemories || []),
      JSON.stringify(plot.creditProfile || {}),
      JSON.stringify(plot.dmrvRecord || {}),
    ]
  );
  saveDatabase();
  return plot;
}

export async function dbGetFederatedRounds(): Promise<any[]> {
  const db = await getDatabase();
  const stmt = db.prepare("SELECT * FROM federated_rounds ORDER BY round_number DESC");
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      roundNumber: row.round_number,
      timestamp: row.timestamp,
      globalAccuracy: row.global_accuracy,
      nonIIDDivergence: row.non_iid_divergence,
      epsilonUsed: row.epsilon_used,
      aggregationMethod: row.aggregation_method,
      coordinatorNotes: row.coordinator_notes,
      sovereignCertificate: row.sovereign_certificate,
      silosState: JSON.parse((row.silos_state as string) || "[]"),
    });
  }
  stmt.free();
  return results;
}

export async function dbSaveFederatedRound(roundData: any): Promise<void> {
  const db = await getDatabase();
  db.run(
    `INSERT OR REPLACE INTO federated_rounds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      roundData.roundNumber,
      new Date().toISOString(),
      roundData.globalAccuracy,
      roundData.nonIIDDivergenceIndex || 0.24,
      roundData.privacyBudgetConsumedEpsilon || 0.5,
      roundData.aggregationMethod || "DP-FedAvg",
      roundData.coordinatorNotes || "",
      roundData.sovereignAuditCertificate || "",
      JSON.stringify(roundData.updatedSilos || []),
    ]
  );
  saveDatabase();
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getDatabase,
  dbGetDiagnosisHistory,
  dbSaveDiagnosis,
  dbGetEscalatedTickets,
  dbUpdateTicketStatus,
  dbGetOutbreakReports,
  dbSaveOutbreakReport,
  dbGetPlotsTelemetry,
  dbSavePlotTelemetry,
  dbGetFederatedRounds,
  dbSaveFederatedRound,
} from "./server/db";
import {
  getFallbackDiagnosis,
  getFallbackAdvisory,
  getFallbackSimulation,
  getFallbackSynthesis,
  getFallbackFederatedRound,
  getFallbackOutbreakForecast,
  getFallbackCopilotAssist,
  getFallbackCreditAssessment,
  executeWithRetry,
} from "./server/fallbacks";
import {
  geminiMetrics,
  executeObservedGeminiCall,
} from "./server/observability";
import { processImageInput } from "./server/imageSecurity";

dotenv.config();

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database schema
  await getDatabase();

  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      database: "sqlite3",
    });
  });

  // ==========================================
  // PERSISTENCE (SQLITE REST ENDPOINTS)
  // ==========================================

  // Diagnosis History
  app.get("/api/db/diagnoses", async (_req, res) => {
    try {
      const history = await dbGetDiagnosisHistory();
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Escalated Tickets
  app.get("/api/db/tickets", async (_req, res) => {
    try {
      const tickets = await dbGetEscalatedTickets();
      res.json({ success: true, data: tickets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch("/api/db/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, agronomistNotes, prescribedTreatment } = req.body;
      await dbUpdateTicketStatus(id, status, agronomistNotes, prescribedTreatment);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Outbreak Reports
  app.get("/api/db/outbreaks", async (_req, res) => {
    try {
      const reports = await dbGetOutbreakReports();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Plot Telemetry
  app.get("/api/db/plots", async (_req, res) => {
    try {
      const plots = await dbGetPlotsTelemetry();
      res.json({ success: true, data: plots });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put("/api/db/plots/:id", async (req, res) => {
    try {
      const updated = await dbSavePlotTelemetry(req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Federated Training History
  app.get("/api/db/federated", async (_req, res) => {
    try {
      const history = await dbGetFederatedRounds();
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // GEMINI OBSERVABILITY & FAILURE METRICS
  // ==========================================
  app.get("/api/metrics/gemini", (_req, res) => {
    try {
      const snapshot = geminiMetrics.getSnapshot();
      res.json({ success: true, data: snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/metrics/gemini/reset", (_req, res) => {
    try {
      geminiMetrics.reset();
      res.json({ success: true, message: "Gemini observability metrics reset successfully" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // TAB 1: Farmer Advisory Endpoints (Multi-Agent Pipeline)
  // ==========================================

  // SSE Real-Time Streaming 3-Agent Pipeline
  app.post("/api/agent/stream-pipeline", async (req, res) => {
    // Setup Server-Sent Events (SSE) headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    };

    const { query, plotTelemetry } = req.body;
    const ai = getGenAIClient();

    try {
      // -------------------------------------------------------------
      // STEP 1: Agronomic Advisory Agent (Agent 1/3)
      // -------------------------------------------------------------
      sendEvent("agent_start", { agent: "advisory", step: 1, label: "Agronomic Advisory Agent" });

      const advisoryPrompt = `Farmer Question: "${query}"

Plot Telemetry & Environmental Sensors:
${JSON.stringify(plotTelemetry, null, 2)}

Provide your agronomic analysis and candidate recommendations as structured JSON.`;

      const advisoryData = await executeObservedGeminiCall({
        endpoint: "stream-pipeline/advisory-agent",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: advisoryPrompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Agronomic Advisory Agent (Agent 1/3), an expert crop scientist and agricultural extension specialist for smallholder farmers across BRICS nations.
Analyze the query and telemetry to formulate 1-2 candidate agronomic recommendations that are practical, localized to the region/season, and detailed.
Return valid JSON with:
{
  "agent": "Agronomic Advisory Agent",
  "telemetryAssessment": "concise 2-sentence summary of soil and weather conditions",
  "candidateRecommendations": [
    {
      "id": "REC-1",
      "title": "Clear action title",
      "summary": "Specific guidance on timing, variety/practices, and application",
      "keyFactors": ["factor 1", "factor 2"],
      "inputAdvice": "Precise fertilizer/seed/water inputs with metrics",
      "potentialRisks": "Agronomic risks to consider"
    }
  ],
  "reasoningSteps": [
    "step 1: evaluation of soil parameters",
    "step 2: weather forecast alignment",
    "step 3: crop physiological cycle match"
  ]
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackAdvisory(query, plotTelemetry),
        meta: { query, crop: plotTelemetry?.crop, plotId: plotTelemetry?.id },
      });

      sendEvent("agent_completed", {
        agent: "advisory",
        step: 1,
        data: advisoryData,
      });

      // -------------------------------------------------------------
      // STEP 2: Biophysical Simulation Check Agent (Agent 2/3)
      // -------------------------------------------------------------
      sendEvent("agent_start", { agent: "simulation", step: 2, label: "Biophysical Simulation Check Agent" });

      const simPrompt = `Farmer Query: "${query}"
Plot Telemetry:
${JSON.stringify(plotTelemetry, null, 2)}

Proposed Candidate Recommendations from Advisory Agent:
${JSON.stringify(advisoryData?.candidateRecommendations || [], null, 2)}

Run biophysical constraint validation and return results in JSON.`;

      const simData = await executeObservedGeminiCall({
        endpoint: "stream-pipeline/simulation-agent",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: simPrompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Biophysical Simulation Check Agent (Agent 2/3).
You act as an agronomic plausibility and biophysical constraint validator, standing in for crop growth biophysical engines like APSIM and DSSAT.
Return strictly valid JSON:
{
  "agent": "Biophysical Simulation Check Agent",
  "engineSimulated": "APSIM-SoilWat v7.10 / DSSAT CROPGRO Biophysical Validator",
  "overallVerdict": "PASSED" | "MODIFIED_WITH_WARNINGS" | "FLAGGED_RISK",
  "plausibilityScore": 85,
  "biophysicalChecks": [
    {
      "module": "Water Balance & Precipitation Risk",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Cumulative 7-Day Infiltration vs Field Capacity",
      "observation": "Detailed check observation"
    },
    {
      "module": "Nutrient Dynamics & Leaching",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Nitrogen Mobility Index",
      "observation": "Detailed check observation"
    },
    {
      "module": "Thermal / Phenological Window",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Growing Degree Days (GDD)",
      "observation": "Detailed check observation"
    }
  ],
  "simulationFlags": [
    "Specific warning or validation flag"
  ],
  "requiredModifications": "Specific adjustments recommended to safeguard farmer yield"
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackSimulation(query, plotTelemetry, advisoryData?.candidateRecommendations),
        meta: { query, plotId: plotTelemetry?.id },
      });

      sendEvent("agent_completed", {
        agent: "simulation",
        step: 2,
        data: simData,
      });

      // -------------------------------------------------------------
      // STEP 3: Farmer Synthesis Agent (Agent 3/3) - Token Streaming
      // -------------------------------------------------------------
      sendEvent("agent_start", { agent: "synthesis", step: 3, label: "Farmer Synthesis Agent" });

      const synthPrompt = `Farmer Query: "${query}"
Plot Location & Crop: ${plotTelemetry?.location || "Unknown"} - ${plotTelemetry?.crop || "Crop"}
Soil & Weather Snapshot: pH ${plotTelemetry?.soilPH}, N-P-K ${plotTelemetry?.nitrogen}-${plotTelemetry?.phosphorus}-${plotTelemetry?.potassium}, Rain 7d: ${plotTelemetry?.rainfallForecast7d}mm, Soil Moisture: ${plotTelemetry?.soilMoisture}%

Advisory Agent Output:
${JSON.stringify(advisoryData, null, 2)}

Biophysical Simulation Output:
${JSON.stringify(simData, null, 2)}

Synthesize into an actionable, empathetic, farmer-readable markdown guide.`;

      const fullSynthesisMarkdown = await executeObservedGeminiCall({
        endpoint: "stream-pipeline/synthesis-agent",
        model: "gemini-3.7-flash",
        action: async () => {
          if (!process.env.GEMINI_API_KEY) {
            throw new Error("API key not configured");
          }
          const streamResponse = await ai.models.generateContentStream({
            model: "gemini-3.7-flash",
            contents: synthPrompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Farmer Synthesis Agent (Agent 3/3).
Combine the agronomic guidance and the biophysical simulation safeguards into a single, cohesive, plain-language advisory that a smallholder farmer can immediately act on.
Format with clear markdown sections:
- **Direct Answer & Timing**: (Bottom-line verdict in simple terms)
- **Step-by-Step Action Plan**: (Clear chronological steps for field preparation, sowing, or management)
- **Soil & Fertilizer Schedule**: (Exact dosages tailored to the plot's N-P-K and moisture)
- **Biophysical Weather Safeguards**: (Key risks flagged by the simulation engine and how to avoid losses)
- **Local Extension Advice**: (When to consult the local KVK / EMATER agronomist)`,
              temperature: 0.3,
            },
          });

          let collectedText = "";
          for await (const chunk of streamResponse) {
            const chunkText = chunk.text;
            if (chunkText) {
              collectedText += chunkText;
              sendEvent("synthesis_chunk", { chunk: chunkText });
            }
          }
          return collectedText || "Synthesis complete.";
        },
        fallback: () => {
          const fallback = getFallbackSynthesis(query, plotTelemetry, advisoryData, simData);
          sendEvent("synthesis_chunk", { chunk: fallback.finalAnswerMarkdown });
          return fallback.finalAnswerMarkdown;
        },
        meta: { query, plotId: plotTelemetry?.id },
      });

      sendEvent("agent_completed", {
        agent: "synthesis",
        step: 3,
        data: {
          agent: "Farmer Synthesis Agent",
          finalAnswerMarkdown: fullSynthesisMarkdown || "Synthesis complete.",
        },
      });

      sendEvent("done", { success: true });
      res.end();
    } catch (globalError: any) {
      console.error("SSE stream pipeline error:", globalError);
      sendEvent("error", { message: globalError.message || "Pipeline error" });
      res.end();
    }
  });

  // Agent 1: Agronomic Advisory Agent (Standalone endpoint)
  app.post("/api/agent/advisory", async (req, res) => {
    try {
      const { query, plotTelemetry } = req.body;
      const ai = getGenAIClient();

      const prompt = `Farmer Question: "${query}"

Plot Telemetry & Environmental Sensors:
${JSON.stringify(plotTelemetry, null, 2)}

Provide your agronomic analysis and candidate recommendations as structured JSON.`;

      const data = await executeObservedGeminiCall({
        endpoint: "advisory-standalone",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Agronomic Advisory Agent (Agent 1/3), an expert crop scientist and agricultural extension specialist for smallholder farmers across BRICS nations.
Analyze the query and telemetry to formulate 1-2 candidate agronomic recommendations that are practical, localized to the region/season, and detailed.
Return valid JSON with:
{
  "agent": "Agronomic Advisory Agent",
  "telemetryAssessment": "concise 2-sentence summary of soil and weather conditions",
  "candidateRecommendations": [
    {
      "id": "REC-1",
      "title": "Clear action title",
      "summary": "Specific guidance on timing, variety/practices, and application",
      "keyFactors": ["factor 1", "factor 2"],
      "inputAdvice": "Precise fertilizer/seed/water inputs with metrics",
      "potentialRisks": "Agronomic risks to consider"
    }
  ],
  "reasoningSteps": [
    "step 1: evaluation of soil parameters",
    "step 2: weather forecast alignment",
    "step 3: crop physiological cycle match"
  ]
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackAdvisory(query, plotTelemetry),
        meta: { query, plotId: plotTelemetry?.id },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Advisory agent error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate advisory response",
      });
    }
  });

  // Agent 2: Biophysical Simulation Check Agent (APSIM/DSSAT rule-based validator)
  app.post("/api/agent/simulation-check", async (req, res) => {
    try {
      const { query, plotTelemetry, candidateRecommendations } = req.body;
      const ai = getGenAIClient();

      const prompt = `Farmer Query: "${query}"
Plot Telemetry:
${JSON.stringify(plotTelemetry, null, 2)}

Proposed Candidate Recommendations from Advisory Agent:
${JSON.stringify(candidateRecommendations, null, 2)}

Run biophysical constraint validation and return results in JSON.`;

      const data = await executeObservedGeminiCall({
        endpoint: "simulation-check-standalone",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Biophysical Simulation Check Agent (Agent 2/3).
You act as an agronomic plausibility and biophysical constraint validator, standing in for crop growth biophysical engines like APSIM and DSSAT.
Return strictly valid JSON:
{
  "agent": "Biophysical Simulation Check Agent",
  "engineSimulated": "APSIM-SoilWat v7.10 / DSSAT CROPGRO Biophysical Validator",
  "overallVerdict": "PASSED" | "MODIFIED_WITH_WARNINGS" | "FLAGGED_RISK",
  "plausibilityScore": 85,
  "biophysicalChecks": [
    {
      "module": "Water Balance & Precipitation Risk",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Cumulative 7-Day Infiltration vs Field Capacity",
      "observation": "Detailed check observation"
    },
    {
      "module": "Nutrient Dynamics & Leaching",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Nitrogen Mobility Index",
      "observation": "Detailed check observation"
    },
    {
      "module": "Thermal / Phenological Window",
      "verdict": "PASS" | "WARNING" | "FAIL",
      "simulatedMetric": "Growing Degree Days (GDD)",
      "observation": "Detailed check observation"
    }
  ],
  "simulationFlags": [
    "Specific warning or validation flag"
  ],
  "requiredModifications": "Specific adjustments recommended to safeguard farmer yield"
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackSimulation(query, plotTelemetry, candidateRecommendations),
        meta: { query, plotId: plotTelemetry?.id },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Simulation check error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to execute simulation check",
      });
    }
  });

  // Agent 3: Farmer Synthesis Agent
  app.post("/api/agent/synthesis", async (req, res) => {
    try {
      const { query, plotTelemetry, advisoryResult, simulationResult } = req.body;
      const ai = getGenAIClient();

      const prompt = `Farmer Query: "${query}"
Plot Location & Crop: ${plotTelemetry?.location || "Unknown"} - ${plotTelemetry?.crop || "Crop"}
Soil & Weather Snapshot: pH ${plotTelemetry?.soilPH}, N-P-K ${plotTelemetry?.nitrogen}-${plotTelemetry?.phosphorus}-${plotTelemetry?.potassium}, Rain 7d: ${plotTelemetry?.rainfallForecast7d}mm, Soil Moisture: ${plotTelemetry?.soilMoisture}%

Advisory Agent Output:
${JSON.stringify(advisoryResult, null, 2)}

Biophysical Simulation Output:
${JSON.stringify(simulationResult, null, 2)}

Synthesize into an actionable, empathetic, farmer-readable markdown guide.`;

      const data = await executeObservedGeminiCall({
        endpoint: "synthesis-standalone",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Farmer Synthesis Agent (Agent 3/3).
Combine the agronomic guidance and the biophysical simulation safeguards into a single, cohesive, plain-language advisory that a smallholder farmer can immediately act on.
Format with clear markdown sections:
- **Direct Answer & Timing**: (Bottom-line verdict in simple terms)
- **Step-by-Step Action Plan**: (Clear chronological steps for field preparation, sowing, or management)
- **Soil & Fertilizer Schedule**: (Exact dosages tailored to the plot's N-P-K and moisture)
- **Biophysical Weather Safeguards**: (Key risks flagged by the simulation engine and how to avoid losses)
- **Local Extension Advice**: (When to consult the local KVK / EMATER agronomist)`,
              temperature: 0.3,
            },
          });
          return {
            agent: "Farmer Synthesis Agent",
            finalAnswerMarkdown: response.text || "No synthesis generated.",
          };
        },
        fallback: () => getFallbackSynthesis(query, plotTelemetry, advisoryResult, simulationResult),
        meta: { query, plotId: plotTelemetry?.id },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Synthesis agent error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to synthesize advisory",
      });
    }
  });

  // ==========================================
  // TAB 2: Multimodal Crop Photo Diagnosis Agent (Saved to SQLite DB)
  // ==========================================
  app.post("/api/agent/diagnose-crop", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", cropContext = "Unknown Crop", region = "BRICS Region" } = req.body;
      const ai = getGenAIClient();

      if (!imageBase64) {
        return res.status(400).json({ success: false, error: "Image data is required." });
      }

      let processedImage;
      try {
        processedImage = await processImageInput(imageBase64, mimeType || "image/jpeg");
      } catch (validationErr: any) {
        return res.status(400).json({
          success: false,
          error: validationErr.message || "Invalid or disallowed image payload",
        });
      }

      const { base64Data, detectedMimeType } = processedImage;

      const data = await executeObservedGeminiCall({
        endpoint: "diagnose-crop-vision",
        model: "gemini-3.7-flash",
        action: async () => {
          if (!base64Data) {
            throw new Error("No image data available for multimodal analysis");
          }

          const imagePart = {
            inlineData: {
              mimeType: detectedMimeType,
              data: base64Data,
            },
          };

          const textPrompt = `Analyze this crop leaf / plant photo for pest, disease, fungal pathogen, bacterial infection, or nutrient deficiency.
Crop Context: ${cropContext}
Region: ${region}

Provide your diagnosis with a calibrated confidence score (0-100%). Return strictly valid JSON.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: {
              parts: [imagePart, { text: textPrompt }],
            },
            config: {
              systemInstruction: `You are the BRICS AgriNet Multimodal Crop Diagnosis Agent.
You examine plant/leaf images from smallholder farmers across BRICS nations.
CRITICAL INSTRUCTION FOR CONFIDENCE SCORING:
Calculate an honest, calibrated diagnostic confidence score (integer between 0 and 100).
- If the image is clear and exhibits definitive canonical symptoms of a known disease, give 75-98%.
- If the image is blurry, has overlapping complex symptoms, or atypical lesions, give a score BELOW 70% (e.g., 45-65%) to trigger Human-in-the-Loop extension triage.

Return valid JSON:
{
  "identifiedCrop": "Crop name",
  "conditionName": "Specific disease or deficiency name",
  "scientificName": "Pathogen scientific name if applicable",
  "confidenceScore": 88,
  "severityLevel": "Low" | "Moderate" | "High" | "Severe" | "None",
  "visualSymptoms": ["symptom 1", "symptom 2"],
  "biologicalCause": "Biological cause explanation",
  "immediateRemedies": ["remedy 1", "remedy 2"],
  "chemicalOptions": ["chemical 1"],
  "preventativeMeasures": ["preventative 1"],
  "extensionNotes": "Extension verification notes"
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackDiagnosis(cropContext, region),
        meta: { cropContext, region },
      });

      // Persist diagnosis to SQLite database
      const savedRecord = await dbSaveDiagnosis(data, imageBase64, region);

      res.json({ success: true, data: savedRecord });
    } catch (error: any) {
      console.error("Crop diagnosis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to diagnose crop image",
      });
    }
  });

  // ==========================================
  // TAB 3: Federated Learning Commons Agent (Cross-Silo Aggregator & Saved to SQLite DB)
  // ==========================================
  app.post("/api/agent/federated-round", async (req, res) => {
    try {
      const { roundNumber = 1, silos = [], epsilon = 0.5, aggregationMethod = "DP-FedAvg" } = req.body;
      const ai = getGenAIClient();

      // Mathematically advance local silos
      const updatedSilos = silos.map((s: any) => {
        const accuracyGain = Number((4.5 + Math.random() * 2.2).toFixed(1));
        const newAccuracy = Math.min(s.targetAccuracy || 93.0, Number(((s.localAccuracy || 75.0) + accuracyGain).toFixed(1)));
        const newLoss = Math.max(0.08, Number(((s.currentLoss || 0.42) - 0.065).toFixed(3)));
        
        const dpNoiseScale = 0.015 / Math.max(0.1, epsilon);
        const newVectors = (s.weightDeltaVectors || [0.04, -0.02, 0.08, -0.03, 0.05, -0.01]).map(
          (w: number) => Number((w * 0.85 + (Math.random() * dpNoiseScale * 2 - dpNoiseScale)).toFixed(3))
        );

        return {
          ...s,
          localAccuracy: newAccuracy,
          currentLoss: newLoss,
          weightDeltaVectors: newVectors,
        };
      });

      const avgLocalAcc = updatedSilos.reduce((acc: number, s: any) => acc + s.localAccuracy, 0) / (updatedSilos.length || 1);
      const computedGlobalAcc = Math.min(95.4, Number((avgLocalAcc + 3.2).toFixed(1)));
      const consumedEpsilon = Number((epsilon * (roundNumber * 0.4)).toFixed(2));

      const prompt = `Federated Round: ${roundNumber}
Aggregation Method: ${aggregationMethod}
Differential Privacy Epsilon: ${epsilon}
Sovereign Cloud Silos Participating:
${JSON.stringify(updatedSilos.map((s: any) => ({
  country: s.country,
  institution: s.nationalInstitution,
  recordsCount: s.records?.length || 8,
  localAccuracy: s.localAccuracy,
  loss: s.currentLoss,
  weightDeltaSample: s.weightDeltaVectors?.slice(0, 3)
})), null, 2)}

Evaluate cross-silo gradient convergence, non-IID soil variance, and issue a Sovereign Privacy Compliance Audit Certificate.`;

      const aiAudit = await executeObservedGeminiCall({
        endpoint: "federated-round-coordinator",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Federated Aggregation Coordinator Agent (Academic Lead: Dr. Durrant / Indore Declaration Protocol).
Analyze the gradient updates from sovereign agricultural clouds (ICAR India, Embrapa Brazil, ARC South Africa, CAAS China).
Ensure that:
1. Differential privacy noise bounds (Laplace mechanism) prevent reconstruction of individual farmer coordinates or crop yields.
2. Non-IID data divergence across disparate soil types is mitigated via adaptive global weighting.
3. Sovereign data governance mandates are 100% verified.

Return valid JSON:
{
  "coordinatorNotes": "Concise technical summary of gradient convergence and loss reduction across sovereign silos.",
  "nonIIDDivergenceIndex": 0.24,
  "sovereignAuditCertificate": "Official cryptographic verification string confirming zero raw farmer PII left sovereign clouds."
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackFederatedRound(roundNumber, aggregationMethod),
        meta: { roundNumber, aggregationMethod },
      });

      const roundResult = {
        roundNumber,
        globalAccuracy: computedGlobalAcc,
        updatedSilos,
        privacyBudgetConsumedEpsilon: consumedEpsilon,
        aggregationMethod,
        coordinatorNotes: aiAudit.coordinatorNotes,
        nonIIDDivergenceIndex: aiAudit.nonIIDDivergenceIndex || 0.24,
        sovereignAuditCertificate: aiAudit.sovereignAuditCertificate,
      };

      // Persist round state to SQLite DB
      await dbSaveFederatedRound(roundResult);

      res.json({ success: true, data: roundResult });
    } catch (error: any) {
      console.error("Federated round error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to execute federated round" });
    }
  });

  // ==========================================
  // TAB 4: Outbreak Early-Warning Sentinel Agent (Saved to SQLite DB)
  // ==========================================
  app.post("/api/agent/outbreak-forecast", async (req, res) => {
    try {
      const { reports = [], clusteringThresholdKm = 10.0, targetZone = "all" } = req.body;
      const ai = getGenAIClient();

      const borderReports = reports.filter((r: any) => (r.distanceToBorderKm || 99) <= clusteringThresholdKm);
      const isClustered = borderReports.length >= 2;

      const prompt = `Active Transboundary Outbreak Reports:
${JSON.stringify(reports, null, 2)}

Filter Parameters:
- Clustering Threshold: ${clusteringThresholdKm} km to international border
- Target Corridor: ${targetZone}
- Border Cluster Triggered: ${isClustered} (${borderReports.length} incidents within ${clusteringThresholdKm}km of sovereign border)

Provide a 14-day transboundary spore dispersion and pest swarm trajectory forecast based on FAO DLIS standards.`;

      const data = await executeObservedGeminiCall({
        endpoint: "outbreak-forecast-sentinel",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Transboundary Outbreak Sentinel Agent (Grounded in FAO Desert Locust Information Service & Airborne Phytopathology models).
Analyze real-time border spore densities (Asian Soybean Rust, Wheat Stripe Rust, Desert Locust, Fall Armyworm).
Calculate atmospheric transport indices and prescribe bilateral coordination protocols between neighboring sovereign nations.

Return valid JSON:
{
  "transboundaryRiskLevel": "MODERATE" | "HIGH" | "CRITICAL",
  "clusterDetected": true,
  "clusterCount": 3,
  "primaryVector": "Atmospheric high-altitude wind vector carrying urediniospores across the Paraguay-Brazil border corridor",
  "fourteenDaySpreadPrediction": "Detailed 14-day projection of spore arrival and susceptible crop acreage at risk.",
  "atmosphericTransportIndex": 87,
  "multilateralDirectives": [
    "Activate joint bilateral buffer zone scouting within 15 km of international border",
    "Mandate prophylactic multisite fungicide barrier application in downwind cooperatives",
    "Transmit synchronized Sentinel-2 NDRE vegetative stress coordinates to neighboring national ministry"
  ],
  "bufferZoneActionPlan": "Specific geographic recommendations for containment zone width and aerial survey intervals.",
  "affectedBorderBilateralCorridors": [
    "Brazil (Mato Grosso do Sul) - Paraguay (Amambay)",
    "India (Punjab) - Pakistan (Punjab Sector)"
  ]
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackOutbreakForecast(reports, isClustered, borderReports.length),
        meta: { reportsCount: reports.length, isClustered },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Outbreak forecast error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate outbreak forecast" });
    }
  });

  app.post("/api/agent/report-outbreak", async (req, res) => {
    try {
      const { country, region, crop, pestDisease, severity, coordinates, distanceToBorderKm, neighboringCountry, verifiedBy } = req.body;
      const newReport = {
        id: `out-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        country: country || "Brazil",
        flag: country?.includes("India") ? "🇮🇳" : country?.includes("South Africa") ? "🇿🇦" : country?.includes("Paraguay") ? "🇵🇾" : "🇧🇷",
        region: region || "Border Agro-Station",
        crop: crop || "Soybean",
        pestDisease: pestDisease || "Asian Soybean Rust Spore Flare",
        severity: severity || "Severe",
        sporeDensityIndex: Math.floor(75 + Math.random() * 23),
        coordinates: coordinates || { lat: -22.5, lng: -55.7 },
        distanceToBorderKm: Number(distanceToBorderKm || 3.5),
        neighboringCountry: neighboringCountry || "Paraguay",
        verifiedBy: verifiedBy || "Field Agronomist Sentinel",
      };

      // Persist outbreak report to SQLite DB
      await dbSaveOutbreakReport(newReport as any);

      res.json({ success: true, data: newReport });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==========================================
  // TAB 5: Extension Copilot Endpoints (AI Triage & Cropin SmartRisk Scorer)
  // ==========================================
  app.post("/api/agent/copilot-ai-assist", async (req, res) => {
    try {
      const { ticket, fieldNotes } = req.body;
      const ai = getGenAIClient();

      const prompt = `Escalated Human-in-the-Loop Case for Agronomist Verification:
Farmer: ${ticket?.farmerName} (${ticket?.country})
Crop: ${ticket?.crop}
AI Diagnosis: ${ticket?.aiSuggestedCondition} (Confidence: ${ticket?.confidenceScore}%)
Triage Reason: ${ticket?.triageReason}
Field Notes from Extension Officer: "${fieldNotes || "None provided"}"
RAG Grounding Citations:
${JSON.stringify(ticket?.ragCitations || [], null, 2)}

Provide an expert agronomist verification brief, differential diagnosis breakdown, safety contraindications, and verified prescription draft.`;

      const data = await executeObservedGeminiCall({
        endpoint: "copilot-ai-assist",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet Senior Extension Agronomist Copilot.
Assist field officers (KVK, EMATER, ARC) in validating borderline or ambiguous crop disease cases.
Synthesize verified research literature into a rigorous prescription recommendation with actionable safety warnings.

Return valid JSON:
{
  "ticketId": "${ticket?.id || "tkt-001"}",
  "differentialDiagnosis": "Precise distinction between suspected fungal pathogen and physiological abiotic stress.",
  "ragCorroboration": "Direct citation of research directives supporting the verification.",
  "recommendedPrescription": "Exact chemical or biocontrol dosages, tank mixing rules, and application timing.",
  "safetyContraindications": [
    "Do not apply when ambient wind speed exceeds 12 km/h",
    "Observe 14-day pre-harvest interval (PHI)"
  ],
  "fieldVerificationChecklist": [
    "Check abaxial leaf surface under 20x pocket magnifier",
    "Sample 5 random plants in a 'W' pattern"
  ],
  "estimatedYieldRecoveryPct": 92
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackCopilotAssist(ticket, fieldNotes),
        meta: { ticketId: ticket?.id },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Copilot assist error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate copilot assist" });
    }
  });

  app.post("/api/agent/copilot-credit-assessment", async (req, res) => {
    try {
      const { plotTelemetry } = req.body;
      const ai = getGenAIClient();

      const prompt = `Assess Agri-Credit Worthiness & Digital MRV Carbon Performance:
Farmer / Plot: ${plotTelemetry?.name} (${plotTelemetry?.country})
Crop: ${plotTelemetry?.crop}
Historical Yield Consistency: ${plotTelemetry?.historicalYieldAvg || 4.5} tons/ha
NDVI Stability Index: ${plotTelemetry?.ndviCurrent || 0.72}
Soil Organic Carbon: ${plotTelemetry?.organicCarbonPercent || 1.8}%
Episodic Memories:
${JSON.stringify(plotTelemetry?.episodicMemories || [], null, 2)}

Compute dynamic credit score (0-100), rating grade, microloan ceiling, and dMRV carbon revenue estimation (Cropin SmartRisk model).`;

      const data = await executeObservedGeminiCall({
        endpoint: "copilot-credit-assessment",
        model: "gemini-3.7-flash",
        action: async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: `You are the BRICS AgriNet SmartRisk & Digital MRV Assessment Agent (Cropin Model + Sentinel-2 dMRV Standards).
Analyze agronomic adherence, NDVI consistency, yield resilience, and regenerative soil practices to calculate creditworthiness and carbon credit revenue.

Return valid JSON:
{
  "plotId": "${plotTelemetry?.id || "plot-01"}",
  "creditScore": 86,
  "ratingGrade": "A+",
  "defaultProbabilityPct": 2.4,
  "maxMicroLoanUSD": 4500,
  "carbonCreditsEarnedUSD": 76.50,
  "justification": "Comprehensive assessment of farmer creditworthiness based on multi-season yield stability and zero-stubble regenerative practices.",
  "dMRVCertificateHash": "SHA256-dMRV-SENTINEL-VERIFIED-HASH"
}`,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        },
        fallback: () => getFallbackCreditAssessment(plotTelemetry),
        meta: { plotId: plotTelemetry?.id },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Credit assessment error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to assess credit worthiness" });
    }
  });

  // Serve static files in production or Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BRICS AgriNet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

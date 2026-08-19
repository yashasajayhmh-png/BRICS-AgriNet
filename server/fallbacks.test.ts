import { describe, it, expect, vi } from "vitest";
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
} from "./fallbacks";

describe("BRICS AgriNet Resilience Layer: Fallback Generators", () => {
  describe("getFallbackDiagnosis", () => {
    it("returns calibrated low-confidence triage for atypical symptoms (Human-in-the-loop trigger)", () => {
      const result = getFallbackDiagnosis("atypical chlorosis leaf spot", "India");
      expect(result.identifiedCrop).toContain("Atypical Chlorosis");
      expect(result.confidenceScore).toBe(58);
      expect(result.confidenceScore).toBeLessThan(70);
      expect(result.severityLevel).toBe("Moderate");
      expect(result.extensionNotes).toContain("Urgent human extension triage recommended");
      expect(result.visualSymptoms.length).toBeGreaterThanOrEqual(3);
    });

    it("returns Asian Soybean Rust diagnosis when soybean is in context", () => {
      const result = getFallbackDiagnosis("Soybean leaf sample from Cerrado", "Brazil");
      expect(result.identifiedCrop).toContain("Soybean");
      expect(result.conditionName).toBe("Asian Soybean Rust");
      expect(result.scientificName).toBe("Phakopsora pachyrhizi");
      expect(result.confidenceScore).toBe(92);
      expect(result.severityLevel).toBe("Severe");
      expect(result.chemicalOptions[0]).toContain("Azoxystrobin");
      expect(result.preventativeMeasures[0]).toContain("vazio sanitário");
    });

    it("returns Stripe Rust diagnosis when wheat is in context", () => {
      const result = getFallbackDiagnosis("Wheat flag leaf striping", "India (Punjab)");
      expect(result.identifiedCrop).toContain("Wheat");
      expect(result.conditionName).toBe("Stripe / Yellow Rust");
      expect(result.scientificName).toBe("Puccinia striiformis f. sp. tritici");
      expect(result.confidenceScore).toBe(89);
      expect(result.chemicalOptions[0]).toContain("Propiconazole");
    });

    it("returns Tikka Disease default for groundnut or unspecified crop contexts", () => {
      const result = getFallbackDiagnosis("unspecified crop", "South Africa");
      expect(result.identifiedCrop).toContain("Groundnut / Peanut");
      expect(result.conditionName).toBe("Early Leaf Spot (Tikka Disease)");
      expect(result.confidenceScore).toBe(88);
      expect(result.immediateRemedies.length).toBeGreaterThan(0);
    });
  });

  describe("getFallbackAdvisory (Agent 1)", () => {
    it("generates structured recommendations with rain-adjusted timing", () => {
      const plotWithHeavyRain = {
        name: "Plot 1",
        soilPH: 6.8,
        soilMoisture: 65,
        rainfallForecast7d: 45,
        ndviCurrent: 0.71,
      };

      const result = getFallbackAdvisory("When should I fertilize?", plotWithHeavyRain);
      expect(result.agent).toBe("Agronomic Advisory Agent");
      expect(result.candidateRecommendations.length).toBe(1);
      expect(result.candidateRecommendations[0].title).toBe("Split Fertilizer Timing Post-Rain Window");
      expect(result.candidateRecommendations[0].summary).toContain("45mm rain window");
      expect(result.reasoningSteps.length).toBe(3);
    });

    it("generates direct top-dressing advice under normal rainfall", () => {
      const plotNormal = {
        name: "Plot 2",
        soilPH: 7.2,
        soilMoisture: 48,
        rainfallForecast7d: 5,
        ndviCurrent: 0.65,
      };

      const result = getFallbackAdvisory("Top dressing guidance", plotNormal);
      expect(result.candidateRecommendations[0].title).toBe("Direct Fertilizer Top-Dressing & Foliar Care");
      expect(result.telemetryAssessment).toContain("pH is measured at 7.2");
    });
  });

  describe("getFallbackSimulation (Agent 2 - APSIM/DSSAT Check)", () => {
    it("flags biophysical warning and reduces plausibility under excessive rainfall", () => {
      const heavyRainPlot = {
        rainfallForecast7d: 50,
        soilMoisture: 75,
        tempRange: { min: 18, max: 28 },
      };

      const result = getFallbackSimulation("Fertilizer plan", heavyRainPlot, []);
      expect(result.agent).toBe("Biophysical Simulation Check Agent");
      expect(result.overallVerdict).toBe("MODIFIED_WITH_WARNINGS");
      expect(result.plausibilityScore).toBe(78);
      expect(result.simulationFlags[0]).toContain("Hold soluble chemical top-dressing");
      expect(result.requiredModifications).toContain("Adjust nitrogen application");
    });

    it("passes simulation validation under optimal soil moisture conditions", () => {
      const optimalPlot = {
        rainfallForecast7d: 10,
        soilMoisture: 45,
        tempRange: { min: 16, max: 26 },
      };

      const result = getFallbackSimulation("Standard plan", optimalPlot, []);
      expect(result.overallVerdict).toBe("PASSED");
      expect(result.plausibilityScore).toBe(91);
      expect(result.requiredModifications).toBe("Proceed with scheduled agronomic management plan.");
    });
  });

  describe("getFallbackSynthesis (Agent 3 - Plain-Language Action Plan)", () => {
    it("synthesizes all telemetry, advisory, and biophysical checks into markdown", () => {
      const plot = {
        region: "Mato Grosso",
        soilMoisture: 54,
        soilPH: 6.5,
        rainfallForecast7d: 12,
        soilType: "Cerrado Oxisol",
      };
      const sim = {
        overallVerdict: "PASSED",
        plausibilityScore: 92,
        simulationFlags: ["Standard moisture verified."],
      };

      const result = getFallbackSynthesis("Provide full plan", plot, {}, sim);
      expect(result.agent).toBe("Farmer Synthesis Agent");
      expect(result.finalAnswerMarkdown).toContain("Mato Grosso");
      expect(result.finalAnswerMarkdown).toContain("54%");
      expect(result.finalAnswerMarkdown).toContain("PASSED");
      expect(result.finalAnswerMarkdown).toContain("Krishi Vigyan Kendra (KVK) / EMATER / ARC");
    });
  });

  describe("getFallbackFederatedRound (Tab 3)", () => {
    it("generates privacy-compliant audit certificate and convergence metrics", () => {
      const result = getFallbackFederatedRound(3, "DP-FedAvg");
      expect(result.coordinatorNotes).toContain("Round 3 completed with DP-FedAvg");
      expect(result.nonIIDDivergenceIndex).toBe(0.22);
      expect(result.sovereignAuditCertificate).toContain("BRICS-FED-SECURE-3-");
      expect(result.sovereignAuditCertificate).toContain("Zero raw farmer PII transmitted");
    });
  });

  describe("getFallbackOutbreakForecast (Tab 4)", () => {
    it("sets risk level to CRITICAL when transboundary clustering is triggered", () => {
      const result = getFallbackOutbreakForecast([], true, 3);
      expect(result.transboundaryRiskLevel).toBe("CRITICAL");
      expect(result.clusterDetected).toBe(true);
      expect(result.clusterCount).toBe(3);
      expect(result.multilateralDirectives).toContain("Trigger Article IV Bilateral Early Warning Protocol between SENAVE Paraguay and MAPA Brazil");
      expect(result.affectedBorderBilateralCorridors.length).toBeGreaterThanOrEqual(3);
    });

    it("sets risk level to HIGH when no border cluster is detected", () => {
      const result = getFallbackOutbreakForecast([], false, 0);
      expect(result.transboundaryRiskLevel).toBe("HIGH");
      expect(result.clusterDetected).toBe(false);
    });
  });

  describe("getFallbackCopilotAssist & Credit Assessment (Tab 5)", () => {
    it("creates agronomist triage brief with safety contraindications and recovery rate", () => {
      const ticket = {
        id: "tkt-101",
        crop: "Soybean",
        farmerName: "Mateus Silva",
      };
      const result = getFallbackCopilotAssist(ticket, "Observed brown lesions");
      expect(result.ticketId).toBe("tkt-101");
      expect(result.differentialDiagnosis).toContain("Soybean");
      expect(result.safetyContraindications.length).toBeGreaterThan(0);
      expect(result.estimatedYieldRecoveryPct).toBe(94);
    });

    it("computes digital MRV credit score and pre-approval metrics", () => {
      const plot = {
        id: "plot-99",
        ndviCurrent: 0.78,
      };
      const result = getFallbackCreditAssessment(plot);
      expect(result.plotId).toBe("plot-99");
      expect(result.creditScore).toBe(88);
      expect(result.ratingGrade).toBe("A+");
      expect(result.maxMicroLoanUSD).toBe(4800);
      expect(result.carbonCreditsEarnedUSD).toBe(72.00);
      expect(result.dMRVCertificateHash).toContain("BRICS-dMRV");
    });
  });

  describe("executeWithRetry Resilience Executor", () => {
    it("returns successful result immediately on first try without invoking fallback", async () => {
      const successAction = vi.fn().mockResolvedValue({ status: "success" });
      const fallbackFn = vi.fn().mockReturnValue({ status: "fallback" });

      const res = await executeWithRetry(successAction, fallbackFn, 2, 10);
      expect(res).toEqual({ status: "success" });
      expect(successAction).toHaveBeenCalledTimes(1);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it("retries on transient 503 UNAVAILABLE error and succeeds if next attempt works", async () => {
      let attempts = 0;
      const transientAction = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts === 1) {
          throw new Error('{"error":{"code":503,"message":"This model is currently experiencing high demand.","status":"UNAVAILABLE"}}');
        }
        return { status: "recovered_on_retry" };
      });
      const fallbackFn = vi.fn().mockReturnValue({ status: "fallback" });

      const res = await executeWithRetry(transientAction, fallbackFn, 2, 10);
      expect(res).toEqual({ status: "recovered_on_retry" });
      expect(transientAction).toHaveBeenCalledTimes(2);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it("gracefully falls back to fallback generator if all retries are exhausted on transient errors", async () => {
      const failingAction = vi.fn().mockRejectedValue(new Error("503 Service Unavailable"));
      const fallbackFn = vi.fn().mockReturnValue({ status: "safe_fallback" });

      const res = await executeWithRetry(failingAction, fallbackFn, 1, 5);
      expect(res).toEqual({ status: "safe_fallback" });
      expect(failingAction).toHaveBeenCalledTimes(2); // Initial attempt + 1 retry
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it("immediately triggers fallback without retrying on non-transient fatal errors", async () => {
      const nonTransientAction = vi.fn().mockRejectedValue(new Error("Invalid API schema validation"));
      const fallbackFn = vi.fn().mockReturnValue({ status: "schema_fallback" });

      const res = await executeWithRetry(nonTransientAction, fallbackFn, 3, 10);
      expect(res).toEqual({ status: "schema_fallback" });
      expect(nonTransientAction).toHaveBeenCalledTimes(1);
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });
  });
});

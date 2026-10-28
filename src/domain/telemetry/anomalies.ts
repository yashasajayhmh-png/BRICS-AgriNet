/**
 * Pure Telemetry Domain Module: Soil & Satellite Biophysical Anomaly Detection.
 * 
 * Invariants:
 * 1. Pure function mapping baseline statistics and observation to anomaly classification.
 * 2. Deterministic threshold evaluation with injected clock.
 */

export interface BiophysicalBaseline {
  plotId: string;
  expectedNdviMean: number;
  expectedNdviStdDev: number;
  criticalSoilMoistureMin: number;
  criticalSoilMoistureMax: number;
  phOptimalMin: number;
  phOptimalMax: number;
}

export interface TelemetryReading {
  plotId: string;
  observedNdvi: number;
  observedSoilMoisture: number; // 0.00 to 1.00
  observedSoilPh: number;
  timestampIso: string;
}

export interface AnomalyReport {
  plotId: string;
  isVegetationDropAnomaly: boolean;
  isMoistureAnomaly: boolean;
  isPhAnomaly: boolean;
  ndviZScore: number;
  moistureDeviation: number;
  severity: 'NORMAL' | 'ADVISORY' | 'WARNING' | 'EMERGENCY';
  summary: string;
}

export function detectTelemetryAnomalies(
  baseline: BiophysicalBaseline,
  reading: TelemetryReading
): AnomalyReport {
  // NDVI Z-score
  const std = baseline.expectedNdviStdDev > 0 ? baseline.expectedNdviStdDev : 0.05;
  const ndviZScore = (reading.observedNdvi - baseline.expectedNdviMean) / std;
  const isVegetationDropAnomaly = ndviZScore < -2.0; // More than 2 standard deviations below normal

  // Soil moisture deviation
  const isMoistureTooDry = reading.observedSoilMoisture < baseline.criticalSoilMoistureMin;
  const isMoistureTooWet = reading.observedSoilMoisture > baseline.criticalSoilMoistureMax;
  const isMoistureAnomaly = isMoistureTooDry || isMoistureTooWet;
  const moistureDeviation = isMoistureTooDry
    ? baseline.criticalSoilMoistureMin - reading.observedSoilMoisture
    : isMoistureTooWet
    ? reading.observedSoilMoisture - baseline.criticalSoilMoistureMax
    : 0;

  // pH anomaly
  const isPhAnomaly =
    reading.observedSoilPh < baseline.phOptimalMin || reading.observedSoilPh > baseline.phOptimalMax;

  // Severity classification
  let severity: 'NORMAL' | 'ADVISORY' | 'WARNING' | 'EMERGENCY' = 'NORMAL';
  if (isVegetationDropAnomaly && isMoistureTooDry) {
    severity = 'EMERGENCY';
  } else if (isVegetationDropAnomaly || (isMoistureAnomaly && moistureDeviation > 0.15)) {
    severity = 'WARNING';
  } else if (isMoistureAnomaly || isPhAnomaly) {
    severity = 'ADVISORY';
  }

  let summary = 'Plot telemetry within expected biophysical envelope.';
  if (severity === 'EMERGENCY') {
    summary = 'Critical vegetation collapse detected concurrently with acute root-zone moisture deficit.';
  } else if (severity === 'WARNING') {
    summary = isVegetationDropAnomaly
      ? 'Significant canopy decline observed relative to historical satellite baseline.'
      : 'Severe soil moisture stress observed requiring irrigation intervention.';
  } else if (severity === 'ADVISORY') {
    summary = isPhAnomaly
      ? `Soil pH (${reading.observedSoilPh.toFixed(1)}) deviates from crop target range.`
      : 'Mild soil moisture deviation observed.';
  }

  return {
    plotId: reading.plotId,
    isVegetationDropAnomaly,
    isMoistureAnomaly,
    isPhAnomaly,
    ndviZScore: Number(ndviZScore.toFixed(2)),
    moistureDeviation: Number(moistureDeviation.toFixed(3)),
    severity,
    summary,
  };
}

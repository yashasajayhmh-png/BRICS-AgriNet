/**
 * Pure Agronomy Domain Module: Yield Stress & Climate Risk Adjustment.
 * 
 * Invariants:
 * 1. Yield adjustment multiplier is strictly bounded in [0.0, 1.0].
 * 2. Projected yield loss is strictly bounded in [0.0, 100.0]%.
 * 3. Deterministic computation with pure inputs.
 */

import { Percentage, asPercentage } from '../types/units';

export interface CropBiophysicalParameters {
  baselineYieldTonsHa: number;
  criticalSoilMoistureThreshold: number; // e.g. 0.35 (below which water stress accumulates)
  maxHeatToleranceTempC: number; // e.g. 35°C
  cropStage: 'Vegetative' | 'Flowering' | 'GrainFilling' | 'Maturity';
}

export interface EnvironmentalStressObservation {
  soilMoistureIndexSMI: number; // 0.00 to 1.00
  consecutiveHeatStressDays: number;
  diseaseSeverityIndexPct: number; // 0 to 100
  hailOrFloodDamagePct: number; // 0 to 100
}

export interface YieldRiskAssessment {
  baselineYieldTonsHa: number;
  adjustedYieldTonsHa: number;
  overallYieldLossPct: Percentage;
  waterStressPenaltyPct: number;
  heatStressPenaltyPct: number;
  diseasePenaltyPct: number;
  physicalDamagePenaltyPct: number;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export function computeYieldRiskAdjustment(
  crop: CropBiophysicalParameters,
  obs: EnvironmentalStressObservation
): YieldRiskAssessment {
  // Crop stage vulnerability multiplier
  const stageVulnerability =
    crop.cropStage === 'Flowering' ? 1.4 :
    crop.cropStage === 'GrainFilling' ? 1.2 :
    crop.cropStage === 'Vegetative' ? 0.9 : 0.6;

  // 1. Water stress penalty
  let waterPenalty = 0;
  if (obs.soilMoistureIndexSMI < crop.criticalSoilMoistureThreshold) {
    const deficitRatio = (crop.criticalSoilMoistureThreshold - obs.soilMoistureIndexSMI) / crop.criticalSoilMoistureThreshold;
    waterPenalty = Math.min(50, deficitRatio * 45 * stageVulnerability);
  }

  // 2. Heat stress penalty
  const heatPenalty = Math.min(40, obs.consecutiveHeatStressDays * 4.5 * stageVulnerability);

  // 3. Pest / disease penalty
  const diseasePenalty = Math.min(60, (obs.diseaseSeverityIndexPct * 0.5) * stageVulnerability);

  // 4. Physical damage penalty
  const physicalPenalty = Math.min(100, Math.max(0, obs.hailOrFloodDamagePct));

  // Combined multiplicative survival factor:
  // Survival = (1 - pWater) * (1 - pHeat) * (1 - pDisease) * (1 - pPhysical)
  const factorWater = Math.max(0, 1 - waterPenalty / 100);
  const factorHeat = Math.max(0, 1 - heatPenalty / 100);
  const factorDisease = Math.max(0, 1 - diseasePenalty / 100);
  const factorPhysical = Math.max(0, 1 - physicalPenalty / 100);

  const combinedSurvival = factorWater * factorHeat * factorDisease * factorPhysical;
  const clampedSurvival = Math.max(0, Math.min(1, combinedSurvival));
  const rawYieldLossPct = (1 - clampedSurvival) * 100;

  const adjustedYield = Math.max(0, crop.baselineYieldTonsHa * clampedSurvival);

  const riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    rawYieldLossPct < 15 ? 'LOW' :
    rawYieldLossPct < 35 ? 'MODERATE' :
    rawYieldLossPct < 60 ? 'HIGH' : 'CRITICAL';

  return {
    baselineYieldTonsHa: crop.baselineYieldTonsHa,
    adjustedYieldTonsHa: Number(adjustedYield.toFixed(2)),
    overallYieldLossPct: asPercentage(Number(rawYieldLossPct.toFixed(1))),
    waterStressPenaltyPct: Number(waterPenalty.toFixed(1)),
    heatStressPenaltyPct: Number(heatPenalty.toFixed(1)),
    diseasePenaltyPct: Number(diseasePenalty.toFixed(1)),
    physicalDamagePenaltyPct: Number(physicalPenalty.toFixed(1)),
    riskTier,
  };
}

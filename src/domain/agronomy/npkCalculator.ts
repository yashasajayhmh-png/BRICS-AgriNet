/**
 * Pure Agronomy Domain Module: NPK Nutrient Deficit & Balancing Calculator.
 * 
 * Invariants:
 * 1. Nutrient deficit is monotonic with respect to applied fertilizer (increasing applied fertilizer strictly non-increases deficit).
 * 2. Deficit cannot be negative (excess nutrients result in 0 deficit and a positive surplus).
 * 3. Pure functions with no external dependencies or DOM.
 */

import {
  KilogramsPerHectare,
  asKgPerHa,
} from '../types/units';

export interface CropNutrientTarget {
  cropName: string;
  targetYieldTonsHa: number;
  nitrogenTargetKgHa: KilogramsPerHectare;
  phosphorusTargetKgHa: KilogramsPerHectare;
  potassiumTargetKgHa: KilogramsPerHectare;
}

export interface SoilTestLevels {
  nitrogenCurrentKgHa: KilogramsPerHectare;
  phosphorusCurrentKgHa: KilogramsPerHectare;
  potassiumCurrentKgHa: KilogramsPerHectare;
  organicCarbonPct: number;
  soilPH: number;
}

export interface FertilizerApplicationInput {
  appliedNitrogenKgHa: KilogramsPerHectare;
  appliedPhosphorusKgHa: KilogramsPerHectare;
  appliedPotassiumKgHa: KilogramsPerHectare;
}

export interface NPKBalanceResult {
  nitrogenDeficitKgHa: KilogramsPerHectare;
  phosphorusDeficitKgHa: KilogramsPerHectare;
  potassiumDeficitKgHa: KilogramsPerHectare;
  nitrogenSurplusKgHa: KilogramsPerHectare;
  phosphorusSurplusKgHa: KilogramsPerHectare;
  potassiumSurplusKgHa: KilogramsPerHectare;
  nutrientSufficiencyIndexPct: number; // 0 - 100%
  recommendedUreaKgHa: KilogramsPerHectare; // 46% N
  recommendedDAPKgHa: KilogramsPerHectare; // 18% N, 46% P2O5
  recommendedMOPKgHa: KilogramsPerHectare; // 60% K2O
}

export function calculateNPKDeficit(
  target: CropNutrientTarget,
  soil: SoilTestLevels,
  applied: FertilizerApplicationInput = {
    appliedNitrogenKgHa: asKgPerHa(0),
    appliedPhosphorusKgHa: asKgPerHa(0),
    appliedPotassiumKgHa: asKgPerHa(0),
  }
): NPKBalanceResult {
  // Total available = soil test residual + applied inputs
  const totalN = (soil.nitrogenCurrentKgHa as number) + (applied.appliedNitrogenKgHa as number);
  const totalP = (soil.phosphorusCurrentKgHa as number) + (applied.appliedPhosphorusKgHa as number);
  const totalK = (soil.potassiumCurrentKgHa as number) + (applied.appliedPotassiumKgHa as number);

  const reqN = target.nitrogenTargetKgHa as number;
  const reqP = target.phosphorusTargetKgHa as number;
  const reqK = target.potassiumTargetKgHa as number;

  const rawDeficitN = Math.max(0, reqN - totalN);
  const rawDeficitP = Math.max(0, reqP - totalP);
  const rawDeficitK = Math.max(0, reqK - totalK);

  const rawSurplusN = Math.max(0, totalN - reqN);
  const rawSurplusP = Math.max(0, totalP - reqP);
  const rawSurplusK = Math.max(0, totalK - reqK);

  // Sufficiency ratio (average fulfillment across 3 macronutrients, capped at 100%)
  const ratioN = reqN > 0 ? Math.min(1, totalN / reqN) : 1;
  const ratioP = reqP > 0 ? Math.min(1, totalP / reqP) : 1;
  const ratioK = reqK > 0 ? Math.min(1, totalK / reqK) : 1;
  const sufficiency = ((ratioN + ratioP + ratioK) / 3) * 100;

  // Fertilizer recommendations for unmet deficits:
  // DAP (18-46-0) supplies P2O5. To satisfy deficit P:
  const dapNeeded = rawDeficitP > 0 ? rawDeficitP / 0.46 : 0;
  // DAP also supplies 18% N:
  const nFromDAP = dapNeeded * 0.18;
  const remainingNDeficit = Math.max(0, rawDeficitN - nFromDAP);
  // Urea (46-0-0) supplies remaining N:
  const ureaNeeded = remainingNDeficit > 0 ? remainingNDeficit / 0.46 : 0;
  // MOP (0-0-60) supplies K2O:
  const mopNeeded = rawDeficitK > 0 ? rawDeficitK / 0.6 : 0;

  return {
    nitrogenDeficitKgHa: asKgPerHa(rawDeficitN),
    phosphorusDeficitKgHa: asKgPerHa(rawDeficitP),
    potassiumDeficitKgHa: asKgPerHa(rawDeficitK),
    nitrogenSurplusKgHa: asKgPerHa(rawSurplusN),
    phosphorusSurplusKgHa: asKgPerHa(rawSurplusP),
    potassiumSurplusKgHa: asKgPerHa(rawSurplusK),
    nutrientSufficiencyIndexPct: Number(sufficiency.toFixed(1)),
    recommendedUreaKgHa: asKgPerHa(Number(ureaNeeded.toFixed(1))),
    recommendedDAPKgHa: asKgPerHa(Number(dapNeeded.toFixed(1))),
    recommendedMOPKgHa: asKgPerHa(Number(mopNeeded.toFixed(1))),
  };
}

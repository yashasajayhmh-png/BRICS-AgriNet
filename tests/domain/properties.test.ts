/**
 * Property-Based Invariance Test Suite using fast-check.
 * 
 * Invariants Proven:
 * 1. Yield Risk Adjustment: Projected loss is always in [0.0, 100.0]%.
 * 2. NPK Deficit Monotonicity: Increasing applied nutrient never increases deficit.
 * 3. Haversine Distance: Strictly symmetric (dist(a, b) === dist(b, a)) and non-negative.
 * 4. Spatial Clustering: Order-independent (permutations of incident list yield identical clusters).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeYieldRiskAdjustment } from '../../src/domain/agronomy/yieldRisk';
import { calculateNPKDeficit } from '../../src/domain/agronomy/npkCalculator';
import { calculateHaversineDistanceKm, clusterOutbreakIncidents, OutbreakIncidentRecord } from '../../src/domain/telemetry/clustering';
import { asKgPerHa } from '../../src/domain/types/units';

describe('Domain Mathematical Invariants (Property-Based with fast-check)', () => {
  it('Property 1: Yield loss percentage is always within [0, 100]%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.0, max: 20.0, noNaN: true }), // baseline yield
        fc.double({ min: 0.1, max: 0.6, noNaN: true }), // critical threshold
        fc.constantFrom<'Vegetative' | 'Flowering' | 'GrainFilling' | 'Maturity'>(
          'Vegetative',
          'Flowering',
          'GrainFilling',
          'Maturity'
        ),
        fc.double({ min: 0.0, max: 1.0, noNaN: true }), // soil moisture
        fc.integer({ min: 0, max: 20 }), // heat stress days
        fc.double({ min: 0.0, max: 100.0, noNaN: true }), // disease severity
        fc.double({ min: 0.0, max: 100.0, noNaN: true }), // physical damage
        (baseYield, critThreshold, stage, smi, heatDays, diseaseSev, damage) => {
          const assessment = computeYieldRiskAdjustment(
            {
              baselineYieldTonsHa: baseYield,
              criticalSoilMoistureThreshold: critThreshold,
              maxHeatToleranceTempC: 35,
              cropStage: stage,
            },
            {
              soilMoistureIndexSMI: smi,
              consecutiveHeatStressDays: heatDays,
              diseaseSeverityIndexPct: diseaseSev,
              hailOrFloodDamagePct: damage,
            }
          );

          const loss = assessment.overallYieldLossPct as number;
          expect(loss).toBeGreaterThanOrEqual(0);
          expect(loss).toBeLessThanOrEqual(100);
          expect(assessment.adjustedYieldTonsHa).toBeGreaterThanOrEqual(0);
          expect(assessment.adjustedYieldTonsHa).toBeLessThanOrEqual(baseYield + 0.01);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property 2: NPK deficit is strictly monotonic with respect to applied fertilizer', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 20, max: 250, noNaN: true }), // target N
        fc.double({ min: 0, max: 150, noNaN: true }), // soil N
        fc.double({ min: 0, max: 100, noNaN: true }), // applied N 1
        fc.double({ min: 0, max: 100, noNaN: true }), // incremental addition
        (targetN, soilN, appliedN1, deltaApplied) => {
          const appliedN2 = appliedN1 + deltaApplied;

          const target = {
            cropName: 'Wheat',
            targetYieldTonsHa: 5,
            nitrogenTargetKgHa: asKgPerHa(targetN),
            phosphorusTargetKgHa: asKgPerHa(60),
            potassiumTargetKgHa: asKgPerHa(40),
          };

          const soil = {
            nitrogenCurrentKgHa: asKgPerHa(soilN),
            phosphorusCurrentKgHa: asKgPerHa(30),
            potassiumCurrentKgHa: asKgPerHa(30),
            organicCarbonPct: 0.8,
            soilPH: 6.8,
          };

          const res1 = calculateNPKDeficit(target, soil, {
            appliedNitrogenKgHa: asKgPerHa(appliedN1),
            appliedPhosphorusKgHa: asKgPerHa(0),
            appliedPotassiumKgHa: asKgPerHa(0),
          });

          const res2 = calculateNPKDeficit(target, soil, {
            appliedNitrogenKgHa: asKgPerHa(appliedN2),
            appliedPhosphorusKgHa: asKgPerHa(0),
            appliedPotassiumKgHa: asKgPerHa(0),
          });

          // Deficit with more applied fertilizer must be less than or equal to deficit with less fertilizer
          expect((res2.nitrogenDeficitKgHa as number)).toBeLessThanOrEqual(
            (res1.nitrogenDeficitKgHa as number) + 1e-6
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property 3: Haversine distance is symmetric and satisfies identity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -85, max: 85, noNaN: true }),
        fc.double({ min: -175, max: 175, noNaN: true }),
        fc.double({ min: -85, max: 85, noNaN: true }),
        fc.double({ min: -175, max: 175, noNaN: true }),
        (lat1, lon1, lat2, lon2) => {
          const p1 = { latitude: lat1, longitude: lon1 };
          const p2 = { latitude: lat2, longitude: lon2 };

          // Identity
          expect(calculateHaversineDistanceKm(p1, p1)).toBe(0);

          // Symmetry
          const d12 = calculateHaversineDistanceKm(p1, p2);
          const d21 = calculateHaversineDistanceKm(p2, p1);
          expect(d12).toBeCloseTo(d21, 5);
          expect(d12).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property 4: Outbreak spatial clustering is order-independent (array permutation invariant)', () => {
    const fixedIncidents: OutbreakIncidentRecord[] = [
      { id: 'inc-01', latitude: 30.9, longitude: 75.8, pestOrPathogen: 'Rust', severityLevel: 'high', reportedAtIso: '2026-10-01T10:00:00Z' },
      { id: 'inc-02', latitude: 30.95, longitude: 75.85, pestOrPathogen: 'Rust', severityLevel: 'critical', reportedAtIso: '2026-10-01T11:00:00Z' },
      { id: 'inc-03', latitude: 31.8, longitude: 76.5, pestOrPathogen: 'Rust', severityLevel: 'low', reportedAtIso: '2026-10-01T12:00:00Z' },
      { id: 'inc-04', latitude: -22.5, longitude: -47.1, pestOrPathogen: 'Blight', severityLevel: 'moderate', reportedAtIso: '2026-10-01T13:00:00Z' },
      { id: 'inc-05', latitude: -22.52, longitude: -47.12, pestOrPathogen: 'Blight', severityLevel: 'high', reportedAtIso: '2026-10-01T14:00:00Z' },
    ];

    const baselineClusters = clusterOutbreakIncidents(fixedIncidents, 50);

    fc.assert(
      fc.property(
        fc.shuffledSubarray(fixedIncidents, { minLength: fixedIncidents.length, maxLength: fixedIncidents.length }),
        (shuffled) => {
          const permutedClusters = clusterOutbreakIncidents(shuffled, 50);

          expect(permutedClusters.length).toBe(baselineClusters.length);
          for (let i = 0; i < baselineClusters.length; i++) {
            expect(permutedClusters[i].clusterId).toBe(baselineClusters[i].clusterId);
            expect(permutedClusters[i].incidentIds).toEqual(baselineClusters[i].incidentIds);
            expect(permutedClusters[i].centroidLatitude).toBeCloseTo(baselineClusters[i].centroidLatitude, 4);
            expect(permutedClusters[i].centroidLongitude).toBeCloseTo(baselineClusters[i].centroidLongitude, 4);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

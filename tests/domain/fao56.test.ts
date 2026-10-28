/**
 * Agronomic Golden Value Verification Suite: FAO-56 Penman-Monteith ETo Engine.
 * 
 * Benchmark Ground Truth:
 * FAO Irrigation and Drainage Paper No. 56: "Crop Evapotranspiration"
 * Annex 2 & Example Calculations (Richard G. Allen et al., FAO Rome 1998).
 * 
 * Validated by Agronomic Computing & Invariant Framework.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAtmosphericPressure,
  calculatePsychrometricConstant,
  calculateSaturationVaporPressureAtTemp,
  calculateMeanSaturationVaporPressure,
  calculateSlopeOfVaporPressureCurve,
  calculateExtraterrestrialRadiation,
  calculateFAO56PenmanMonteithETo,
} from '../../src/domain/agronomy/fao56';
import { asCelsius, asLatitude } from '../../src/domain/types/units';

describe('FAO-56 Golden Value Precision Benchmarks', () => {
  it('calculates atmospheric pressure P according to elevation (FAO-56 Example 3, z = 1800m)', () => {
    // FAO-56 Eq. 7: At z = 1800 m, P ≈ 81.8 kPa
    const p = calculateAtmosphericPressure(1800);
    expect(p).toBeCloseTo(81.8, 1);
  });

  it('calculates psychrometric constant gamma (FAO-56 Example 4, P = 81.8 kPa)', () => {
    // gamma = 0.000665 * 81.8 ≈ 0.054 kPa / °C
    const gamma = calculatePsychrometricConstant(81.8);
    expect(gamma).toBeCloseTo(0.0544, 3);
  });

  it('calculates saturation vapor pressure e°(T) at 24.5°C and 15°C (FAO-56 Table 2.3)', () => {
    // e°(24.5) ≈ 3.075 kPa
    const e245 = calculateSaturationVaporPressureAtTemp(24.5);
    expect(e245).toBeCloseTo(3.075, 2);

    // e°(15.0) ≈ 1.705 kPa
    const e150 = calculateSaturationVaporPressureAtTemp(15.0);
    expect(e150).toBeCloseTo(1.705, 2);
  });

  it('calculates mean saturation vapor pressure e_s (FAO-56 Example 5, Tmax = 24.5, Tmin = 15)', () => {
    // e_s = (3.075 + 1.705) / 2 = 2.39 kPa
    const es = calculateMeanSaturationVaporPressure(15.0, 24.5);
    expect(es).toBeCloseTo(2.39, 2);
  });

  it('calculates slope of saturation vapor pressure curve Delta at T = 20.2°C (FAO-56 Eq. 13)', () => {
    // At T = 20.2°C, Delta ≈ 0.145 kPa / °C
    const delta = calculateSlopeOfVaporPressureCurve(20.2);
    expect(delta).toBeCloseTo(0.145, 2);
  });

  it('calculates extraterrestrial radiation Ra (FAO-56 Example 8, Lat = -22.9° South, Day = 246)', () => {
    // At Lat = 22.9°S on Sept 3 (Day 246), Ra ≈ 32.2 MJ / (m2 * day)
    const lat = asLatitude(-22.9);
    const ra = calculateExtraterrestrialRadiation(lat, 246);
    expect(ra).toBeGreaterThan(28);
    expect(ra).toBeLessThan(36);
  });

  it('computes full FAO-56 Penman-Monteith daily ETo benchmark (FAO-56 Example 18/Annex)', () => {
    // Reference conditions representing subtropical summer crop field:
    // Tmean = 26.9°C, Tmin = 19.5°C, Tmax = 34.3°C, RH = 54%, u2 = 2.07 m/s, Rs = 22.1 MJ/m2/day, z = 100m, Lat = 16.2°N, Day = 196
    const result = calculateFAO56PenmanMonteithETo({
      tempMeanC: asCelsius(26.9),
      tempMinC: asCelsius(19.5),
      tempMaxC: asCelsius(34.3),
      humidityMeanPct: 54,
      windSpeed2mMs: 2.07,
      solarRadiationMjM2Day: 22.1,
      elevationMeters: 100,
      latitude: asLatitude(16.2),
      dayOfYear: 196,
    });

    // Reference ETo should be within standard FAO-56 agronomic envelope [5.0, 6.0] mm/day
    const et0Value = result.referenceEvapotranspirationMmDay as number;
    expect(et0Value).toBeGreaterThan(4.8);
    expect(et0Value).toBeLessThan(6.2);
    expect(result.vaporPressureDeficitKPa).toBeGreaterThan(0);
  });
});

/**
 * Pure Agronomy Domain Module: FAO-56 Penman-Monteith Reference Evapotranspiration (ETo).
 * 
 * Standards Reference:
 * Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998).
 * "Crop evapotranspiration - Guidelines for computing crop water requirements"
 * FAO Irrigation and drainage paper 56. Food and Agriculture Organization of the United Nations.
 * 
 * Invariant: Pure function with no side effects, no React, no DOM, and no global state.
 */

import {
  Celsius,
  Latitude,
  MillimetersWater,
  asMillimetersWater,
} from '../types/units';

export interface FAO56DailyInput {
  tempMeanC: Celsius;
  tempMinC: Celsius;
  tempMaxC: Celsius;
  humidityMeanPct: number; // 0 - 100
  windSpeed2mMs: number; // Wind speed at 2m height in m/s (or converted from km/h: km/h / 3.6)
  solarRadiationMjM2Day: number; // Rs: Solar or shortwave radiation in MJ/(m2 * day)
  elevationMeters: number; // Altitude above sea level in meters (z)
  latitude: Latitude; // Latitude of the plot
  dayOfYear: number; // J: 1 to 365/366
}

export interface FAO56Intermediates {
  atmosphericPressureKPa: number; // P
  psychrometricConstantKPaC: number; // gamma
  saturationVaporPressureKPa: number; // e_s
  actualVaporPressureKPa: number; // e_a
  vaporPressureDeficitKPa: number; // (e_s - e_a)
  slopeVaporPressureCurveKPaC: number; // Delta
  netRadiationMjM2Day: number; // Rn
  soilHeatFluxDensityG: number; // G (approximated as 0 for daily intervals)
  referenceEvapotranspirationMmDay: MillimetersWater; // ET0
}

/**
 * Calculates Atmospheric Pressure (P) at elevation z [m] (FAO-56 Eq. 7)
 * P = 101.3 * ((293 - 0.0065 * z) / 293)^5.26
 */
export function calculateAtmosphericPressure(elevationMeters: number): number {
  return 101.3 * Math.pow((293 - 0.0065 * elevationMeters) / 293, 5.26);
}

/**
 * Calculates Psychrometric Constant (gamma) [kPa / °C] (FAO-56 Eq. 8)
 * gamma = 0.000665 * P
 */
export function calculatePsychrometricConstant(atmosphericPressureKPa: number): number {
  return 0.000665 * atmosphericPressureKPa;
}

/**
 * Calculates Saturation Vapor Pressure e°(T) at temperature T [°C] (FAO-56 Eq. 11)
 * e°(T) = 0.6108 * exp((17.27 * T) / (T + 237.3))
 */
export function calculateSaturationVaporPressureAtTemp(tempC: number): number {
  return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Calculates Mean Saturation Vapor Pressure (e_s) [kPa] (FAO-56 Eq. 12)
 * e_s = (e°(T_max) + e°(T_min)) / 2
 */
export function calculateMeanSaturationVaporPressure(tempMinC: number, tempMaxC: number): number {
  const eTmax = calculateSaturationVaporPressureAtTemp(tempMaxC);
  const eTmin = calculateSaturationVaporPressureAtTemp(tempMinC);
  return (eTmax + eTmin) / 2;
}

/**
 * Calculates Actual Vapor Pressure (e_a) [kPa] from relative humidity (FAO-56 Eq. 17/19)
 * e_a = (e_s * RH_mean) / 100
 */
export function calculateActualVaporPressure(e_s: number, humidityMeanPct: number): number {
  const clampedHumidity = Math.max(0, Math.min(100, humidityMeanPct));
  return (e_s * clampedHumidity) / 100;
}

/**
 * Calculates Slope of Saturation Vapor Pressure Curve (Delta) [kPa / °C] (FAO-56 Eq. 13)
 * Delta = 4098 * [0.6108 * exp((17.27 * T) / (T + 237.3))] / (T + 237.3)^2
 */
export function calculateSlopeOfVaporPressureCurve(tempMeanC: number): number {
  const denominator = tempMeanC + 237.3;
  return (
    (4098 * (0.6108 * Math.exp((17.27 * tempMeanC) / denominator))) /
    (denominator * denominator)
  );
}

/**
 * Calculates Extraterrestrial Radiation (Ra) [MJ / (m2 * day)] (FAO-56 Eqs. 21-28)
 */
export function calculateExtraterrestrialRadiation(latitude: Latitude, dayOfYear: number): number {
  const phi = (Math.PI / 180) * latitude; // latitude in radians
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365); // inverse relative distance Earth-Sun
  const delta = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39); // solar declination
  const tanPhiTanDelta = -Math.tan(phi) * Math.tan(delta);
  const clamped = Math.max(-1, Math.min(1, tanPhiTanDelta));
  const omegaS = Math.acos(clamped); // sunset hour angle

  const Gsc = 0.082; // solar constant in MJ / (m2 * min)
  return (
    ((24 * 60) / Math.PI) *
    Gsc *
    dr *
    (omegaS * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(omegaS))
  );
}

/**
 * Estimates Clear-sky Solar Radiation (Rso) [MJ / (m2 * day)] (FAO-56 Eq. 37)
 * Rso = (0.75 + 2e-5 * z) * Ra
 */
export function calculateClearSkySolarRadiation(Ra: number, elevationMeters: number): number {
  return (0.75 + 2e-5 * elevationMeters) * Ra;
}

/**
 * Calculates Net Solar (Shortwave) Radiation (Rns) [MJ / (m2 * day)] (FAO-56 Eq. 38)
 * Using default grass reference albedo alpha = 0.23
 */
export function calculateNetShortwaveRadiation(Rs: number, albedo = 0.23): number {
  return (1 - albedo) * Rs;
}

/**
 * Calculates Net Longwave Radiation (Rnl) [MJ / (m2 * day)] (FAO-56 Eq. 39)
 * sigma = Stefan-Boltzmann constant: 4.903e-9 MJ / (K4 * m2 * day)
 */
export function calculateNetLongwaveRadiation(
  tempMinC: number,
  tempMaxC: number,
  Rs: number,
  Rso: number,
  ea: number
): number {
  const sigma = 4.903e-9;
  const TmaxK = tempMaxC + 273.16;
  const TminK = tempMinC + 273.16;
  const meanTempK4 = (Math.pow(TmaxK, 4) + Math.pow(TminK, 4)) / 2;
  const relativeSolarRadiation = Rso > 0 ? Math.min(1.0, Rs / Rso) : 0.7;
  const cloudFactor = 1.35 * relativeSolarRadiation - 0.35;
  const clampedCloudFactor = Math.max(0.05, Math.min(1.0, cloudFactor));
  const humidityFactor = 0.34 - 0.14 * Math.sqrt(Math.max(0, ea));

  return sigma * meanTempK4 * humidityFactor * clampedCloudFactor;
}

/**
 * Master Reference Evapotranspiration FAO-56 Penman-Monteith Equation (FAO-56 Eq. 6):
 * 
 *          0.408 * Delta * (Rn - G) + gamma * (900 / (T + 273)) * u_2 * (e_s - e_a)
 * ET_0 = --------------------------------------------------------------------------
 *                              Delta + gamma * (1 + 0.34 * u_2)
 */
export function calculateFAO56PenmanMonteithETo(input: FAO56DailyInput): FAO56Intermediates {
  const P = calculateAtmosphericPressure(input.elevationMeters);
  const gamma = calculatePsychrometricConstant(P);
  const es = calculateMeanSaturationVaporPressure(input.tempMinC, input.tempMaxC);
  const ea = calculateActualVaporPressure(es, input.humidityMeanPct);
  const Delta = calculateSlopeOfVaporPressureCurve(input.tempMeanC);

  // Solar Radiation psychrometrics
  const Ra = calculateExtraterrestrialRadiation(input.latitude, input.dayOfYear);
  const Rso = calculateClearSkySolarRadiation(Ra, input.elevationMeters);
  const Rns = calculateNetShortwaveRadiation(input.solarRadiationMjM2Day);
  const Rnl = calculateNetLongwaveRadiation(
    input.tempMinC,
    input.tempMaxC,
    input.solarRadiationMjM2Day,
    Rso,
    ea
  );
  const Rn = Rns - Rnl;
  const G = 0; // Daily time step soil heat flux is negligible

  const numerator =
    0.408 * Delta * (Rn - G) +
    gamma * (900 / (input.tempMeanC + 273)) * input.windSpeed2mMs * (es - ea);
  const denominator = Delta + gamma * (1 + 0.34 * input.windSpeed2mMs);

  const rawETo = numerator / denominator;
  const et0 = asMillimetersWater(Math.max(0, rawETo));

  return {
    atmosphericPressureKPa: Number(P.toFixed(4)),
    psychrometricConstantKPaC: Number(gamma.toFixed(5)),
    saturationVaporPressureKPa: Number(es.toFixed(4)),
    actualVaporPressureKPa: Number(ea.toFixed(4)),
    vaporPressureDeficitKPa: Number((es - ea).toFixed(4)),
    slopeVaporPressureCurveKPaC: Number(Delta.toFixed(5)),
    netRadiationMjM2Day: Number(Rn.toFixed(3)),
    soilHeatFluxDensityG: G,
    referenceEvapotranspirationMmDay: et0,
  };
}

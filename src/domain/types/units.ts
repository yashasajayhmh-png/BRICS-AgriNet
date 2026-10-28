/**
 * Branded nominal types for agricultural units of measurement.
 * Guarantees compile-time safety and prevents dimensional confusion in agronomic models.
 */

export type KilogramsPerHectare = number & { readonly __brand: unique symbol };
export type PoundsPerAcre = number & { readonly __brand: unique symbol };
export type MillimetersWater = number & { readonly __brand: unique symbol };
export type Celsius = number & { readonly __brand: unique symbol };
export type Latitude = number & { readonly __brand: unique symbol };
export type Longitude = number & { readonly __brand: unique symbol };
export type MegaJoulesPerM2 = number & { readonly __brand: unique symbol };
export type Percentage = number & { readonly __brand: unique symbol };

// Unit constructor functions with boundary verification

export function asKgPerHa(val: number): KilogramsPerHectare {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < 0) {
    throw new RangeError(`Invalid kg/ha rate: ${val}. Must be a finite non-negative number.`);
  }
  return val as KilogramsPerHectare;
}

export function asPoundsPerAcre(val: number): PoundsPerAcre {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < 0) {
    throw new RangeError(`Invalid lb/ac rate: ${val}. Must be a finite non-negative number.`);
  }
  return val as PoundsPerAcre;
}

export function asMillimetersWater(val: number): MillimetersWater {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < 0) {
    throw new RangeError(`Invalid water measurement in mm: ${val}. Must be a finite non-negative number.`);
  }
  return val as MillimetersWater;
}

export function asCelsius(val: number): Celsius {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < -60 || val > 70) {
    throw new RangeError(`Invalid temperature in Celsius: ${val}. Out of terrestrial agricultural range [-60, 70].`);
  }
  return val as Celsius;
}

export function asLatitude(val: number): Latitude {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < -90 || val > 90) {
    throw new RangeError(`Invalid latitude: ${val}. Must be in range [-90, 90].`);
  }
  return val as Latitude;
}

export function asLongitude(val: number): Longitude {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < -180 || val > 180) {
    throw new RangeError(`Invalid longitude: ${val}. Must be in range [-180, 180].`);
  }
  return val as Longitude;
}

export function asPercentage(val: number): Percentage {
  if (Number.isNaN(val) || !Number.isFinite(val) || val < 0 || val > 100) {
    throw new RangeError(`Invalid percentage: ${val}. Must be in range [0, 100].`);
  }
  return val as Percentage;
}

// Unit conversion functions
export const LBS_PER_ACRE_TO_KG_PER_HA_FACTOR = 1.12085;

export function convertLbsPerAcreToKgPerHa(lbs: PoundsPerAcre): KilogramsPerHectare {
  return asKgPerHa(lbs * LBS_PER_ACRE_TO_KG_PER_HA_FACTOR);
}

export function convertKgPerHaToLbsPerAcre(kg: KilogramsPerHectare): PoundsPerAcre {
  return asPoundsPerAcre(kg / LBS_PER_ACRE_TO_KG_PER_HA_FACTOR);
}

/**
 * Shared Zod Schemas & Contracts for BRICS AgriNet.
 * Used identically on client (offline queue validation) and server (request body parsing).
 */

import { z } from 'zod';

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const FieldObservationSchema = z.object({
  plotId: z.string().min(1).max(64),
  cropType: z.string().min(1).max(100),
  growthStage: z.enum(['Vegetative', 'Flowering', 'GrainFilling', 'Maturity']),
  observedSymptoms: z.array(z.string().max(256)).max(20),
  affectedAreaPercentage: z.number().min(0).max(100),
  notes: z.string().max(2000).optional(),
  coordinates: CoordinatesSchema.optional(),
  capturedAtIso: z.string().datetime().optional(),
});

export const PrescriptionActionSchema = z.object({
  prescriptionId: z.string().min(1).max(64),
  plotId: z.string().min(1).max(64),
  recommendedTreatment: z.string().min(1).max(500),
  dosageRateKgHa: z.number().min(0).max(10000),
  safetyPrecaution: z.string().max(1000),
  approvedByOfficerId: z.string().min(1).max(64),
  decisionRationale: z.string().max(1000).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED']),
});

export const PlotTelemetrySchema = z.object({
  plotId: z.string().min(1).max(64),
  soilPH: z.number().min(3.0).max(11.0),
  nitrogenKgHa: z.number().min(0).max(1000),
  phosphorusKgHa: z.number().min(0).max(1000),
  potassiumKgHa: z.number().min(0).max(1000),
  organicCarbonSOCPct: z.number().min(0).max(10),
  soilMoistureIndexSMI: z.number().min(0).max(1),
  landSurfaceTempCelsius: z.number().min(-50).max(70),
  timestampIso: z.string().datetime().optional(),
});

export const IdempotencyPayloadSchema = z.object({
  idempotencyKey: z.string().min(10).max(128),
  entityType: z.enum(['plot', 'ticket', 'diagnosis', 'outbreak', 'prescription']),
  entityId: z.string().min(1).max(64),
  data: z.record(z.string(), z.unknown()),
  clientTimestampIso: z.string().datetime(),
});

export const SyncActionSchema = z.object({
  actionId: z.string().min(1).max(64),
  actionType: z.enum([
    'DIAGNOSIS_SUBMIT',
    'ADVISORY_REQUEST',
    'PLOT_TELEMETRY_UPDATE',
    'OUTBREAK_REPORT_SUBMIT',
    'PRESCRIPTION_APPROVE',
  ]),
  payload: IdempotencyPayloadSchema,
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type FieldObservation = z.infer<typeof FieldObservationSchema>;
export type PrescriptionAction = z.infer<typeof PrescriptionActionSchema>;
export type PlotTelemetryInput = z.infer<typeof PlotTelemetrySchema>;
export type IdempotencyPayload = z.infer<typeof IdempotencyPayloadSchema>;
export type SyncAction = z.infer<typeof SyncActionSchema>;

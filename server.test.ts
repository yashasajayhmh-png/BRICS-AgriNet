import { describe, it, expect } from 'vitest';
import { BRICS_PLOTS, ESCALATED_TICKETS, OUTBREAK_REPORTS } from './src/data/mockData';

describe('Resilience and Fallback Data Integrity', () => {
  it('should provide comprehensive plot telemetry across all BRICS member nations', () => {
    expect(BRICS_PLOTS.length).toBeGreaterThanOrEqual(7);
    const countries = BRICS_PLOTS.map((p) => p.country);
    expect(countries).toContain('India');
    expect(countries).toContain('Brazil');
    expect(countries).toContain('South Africa');
    expect(countries).toContain('China');
  });

  it('should have valid soil and crop telemetry metrics on all plots', () => {
    BRICS_PLOTS.forEach((plot) => {
      expect(plot.soilPH).toBeGreaterThan(0);
      expect(plot.soilPH).toBeLessThan(14);
      expect(plot.nitrogen).toBeGreaterThan(0);
      expect(plot.soilMoisture).toBeGreaterThanOrEqual(0);
      expect(plot.ndviCurrent).toBeGreaterThan(0);
      expect(plot.ndviCurrent).toBeLessThanOrEqual(1.0);
    });
  });

  it('should maintain verified triage records for extension copilot escalation', () => {
    expect(ESCALATED_TICKETS.length).toBeGreaterThan(0);
    const criticalTicket = ESCALATED_TICKETS.find((t) => t.confidenceScore < 70);
    expect(criticalTicket).toBeDefined();
    expect(criticalTicket?.status).toBeDefined();
  });

  it('should maintain transboundary pest outbreak sentinel reports', () => {
    expect(OUTBREAK_REPORTS.length).toBeGreaterThan(0);
    OUTBREAK_REPORTS.forEach((report) => {
      expect(report.distanceToBorderKm).toBeGreaterThan(0);
      expect(report.severity).toMatch(/Mild|Moderate|Severe|Critical/);
    });
  });
});

/**
 * Pure Telemetry Domain Module: Geographic Distance & Outbreak Spatial Clustering.
 * 
 * Invariants:
 * 1. Haversine distance is symmetric: distanceKm(a, b) === distanceKm(b, a).
 * 2. Distance from a point to itself is 0: distanceKm(a, a) === 0.
 * 3. Spatial clustering is order-independent: clusterIncidents(reports) produces
 *    the identical set of clusters regardless of input array permutation.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface OutbreakIncidentRecord {
  id: string;
  latitude: number;
  longitude: number;
  pestOrPathogen: string;
  severityLevel: 'low' | 'moderate' | 'high' | 'critical';
  reportedAtIso: string;
}

export interface IncidentCluster {
  clusterId: string;
  centroidLatitude: number;
  centroidLongitude: number;
  pestOrPathogen: string;
  incidentIds: string[];
  maxSeverity: 'low' | 'moderate' | 'high' | 'critical';
  radiusKm: number;
}

const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculates Great-Circle Haversine distance between two points in kilometers.
 * Mathematically proven symmetric.
 */
export function calculateHaversineDistanceKm(p1: GeoCoordinate, p2: GeoCoordinate): number {
  if (p1.latitude === p2.latitude && p1.longitude === p2.longitude) {
    return 0;
  }

  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const lat1Rad = (p1.latitude * Math.PI) / 180;
  const lat2Rad = (p2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return EARTH_RADIUS_KM * c;
}

/**
 * Order-independent spatial clustering of outbreak incidents within threshold distance.
 * Sorts inputs deterministically by ID before running greedy connected-component / radius grouping,
 * guaranteeing identical cluster assignments across any input ordering.
 */
export function clusterOutbreakIncidents(
  incidents: OutbreakIncidentRecord[],
  clusterRadiusKm = 50.0
): IncidentCluster[] {
  if (!incidents || incidents.length === 0) {
    return [];
  }

  // Enforce determinism: sort by unique ID first
  const sorted = [...incidents].sort((a, b) => a.id.localeCompare(b.id));

  // Group by pest/pathogen first
  const byPest = new Map<string, OutbreakIncidentRecord[]>();
  for (const item of sorted) {
    const list = byPest.get(item.pestOrPathogen) || [];
    list.push(item);
    byPest.set(item.pestOrPathogen, list);
  }

  const resultClusters: IncidentCluster[] = [];

  for (const [pest, records] of byPest.entries()) {
    const visited = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const current = records[i];
      if (visited.has(current.id)) continue;

      // New cluster
      const clusterMembers: OutbreakIncidentRecord[] = [current];
      visited.add(current.id);

      // Find all neighbors within radius
      for (let j = 0; j < records.length; j++) {
        if (i === j) continue;
        const candidate = records[j];
        if (visited.has(candidate.id)) continue;

        const dist = calculateHaversineDistanceKm(
          { latitude: current.latitude, longitude: current.longitude },
          { latitude: candidate.latitude, longitude: candidate.longitude }
        );

        if (dist <= clusterRadiusKm) {
          clusterMembers.push(candidate);
          visited.add(candidate.id);
        }
      }

      // Compute centroid
      const totalLat = clusterMembers.reduce((sum, m) => sum + m.latitude, 0);
      const totalLon = clusterMembers.reduce((sum, m) => sum + m.longitude, 0);
      const centroidLat = totalLat / clusterMembers.length;
      const centroidLon = totalLon / clusterMembers.length;

      // Max radius from centroid
      let maxRadius = 0;
      for (const m of clusterMembers) {
        const d = calculateHaversineDistanceKm(
          { latitude: centroidLat, longitude: centroidLon },
          { latitude: m.latitude, longitude: m.longitude }
        );
        if (d > maxRadius) maxRadius = d;
      }

      // Max severity
      const severityOrder: Record<string, number> = { low: 1, moderate: 2, high: 3, critical: 4 };
      let maxSev: 'low' | 'moderate' | 'high' | 'critical' = 'low';
      for (const m of clusterMembers) {
        if (severityOrder[m.severityLevel] > severityOrder[maxSev]) {
          maxSev = m.severityLevel;
        }
      }

      // Deterministic cluster ID from sorted member IDs
      const sortedMemberIds = clusterMembers.map((m) => m.id).sort();
      const clusterId = `cluster-${pest.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${sortedMemberIds[0]}`;

      resultClusters.push({
        clusterId,
        centroidLatitude: Number(centroidLat.toFixed(5)),
        centroidLongitude: Number(centroidLon.toFixed(5)),
        pestOrPathogen: pest,
        incidentIds: sortedMemberIds,
        maxSeverity: maxSev,
        radiusKm: Number(maxRadius.toFixed(2)),
      });
    }
  }

  // Sort output clusters deterministically by clusterId
  return resultClusters.sort((a, b) => a.clusterId.localeCompare(b.clusterId));
}

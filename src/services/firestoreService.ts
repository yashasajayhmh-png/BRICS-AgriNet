import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DiagnosisResult,
  EscalatedTicket,
  PlotTelemetry,
  OutbreakReport,
  FarmerProfile,
} from '../types';
import { BRICS_PLOTS, ESCALATED_TICKETS, OUTBREAK_REPORTS, DEMO_FARMERS } from '../data/mockData';

// 1. PLOTS SERVICE
export async function getPlotsFromFirestore(): Promise<PlotTelemetry[]> {
  const path = 'plots';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      // Seed default plots if Firestore is empty AND user is authenticated
      if (auth.currentUser) {
        await seedDefaultPlots();
      }
      return BRICS_PLOTS;
    }
    const list: PlotTelemetry[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as PlotTelemetry);
    });
    return list;
  } catch (error) {
    console.warn('Falling back to default plots due to Firestore read:', error);
    return BRICS_PLOTS;
  }
}

export async function seedDefaultPlots() {
  const path = 'plots';
  // Security rule prerequisite: Writes to /plots require an authenticated user
  if (!auth.currentUser) {
    return;
  }

  try {
    for (const plot of BRICS_PLOTS) {
      const sanitizedPlot = {
        id: plot.id,
        name: plot.name,
        country: plot.country,
        flag: plot.flag || '',
        region: plot.region || '',
        crop: plot.crop,
        soilType: plot.soilType || '',
        soilPH: plot.soilPH || 7.0,
        ph: plot.soilPH || 7.0,
        nitrogen: plot.nitrogen || 0,
        phosphorus: plot.phosphorus || 0,
        potassium: plot.potassium || 0,
        organicCarbonPercent: plot.organicCarbonPercent || 0,
        soilMoisture: plot.soilMoisture || 0,
        rainfallForecast7d: plot.rainfallForecast7d || 0,
        humidityPercent: plot.humidityPercent || 0,
        ndviCurrent: plot.ndviCurrent || 0,
        ndviIndex: plot.ndviCurrent || 0,
        historicalYieldAvg: plot.historicalYieldAvg || 0,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, path, plot.id), sanitizedPlot, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore plot seeding notice:', error);
  }
}

export function subscribePlots(callback: (plots: PlotTelemetry[]) => void) {
  const path = 'plots';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: PlotTelemetry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as PlotTelemetry);
        });
        callback(list);
      }
    },
    (error) => {
      console.warn('Plots subscription warning:', error);
    }
  );
}

// 2. DIAGNOSES SERVICE
export async function getDiagnosesFromFirestore(): Promise<DiagnosisResult[]> {
  const path = 'diagnoses';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: DiagnosisResult[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as DiagnosisResult);
    });
    return list;
  } catch (error) {
    console.warn('Diagnoses read error:', error);
    return [];
  }
}

export async function saveDiagnosisToFirestore(diag: DiagnosisResult): Promise<void> {
  const path = 'diagnoses';
  if (!auth.currentUser) {
    console.info('Diagnosis saved locally in session (user not signed in to Firebase).');
    return;
  }

  try {
    const docId = `diag_${Date.now()}`;
    const confidenceNormalized =
      diag.confidenceScore > 1 ? diag.confidenceScore / 100 : diag.confidenceScore;

    await setDoc(doc(db, path, docId), {
      ...diag,
      id: docId,
      userId: auth.currentUser.uid,
      crop: diag.identifiedCrop || 'Crop Sample',
      disease: diag.conditionName || 'Diagnosed Condition',
      confidence: confidenceNormalized,
      severityLevel: diag.severityLevel || 'Moderate',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. ESCALATED TICKETS SERVICE
export async function getTicketsFromFirestore(): Promise<EscalatedTicket[]> {
  const path = 'tickets';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      if (auth.currentUser) {
        await seedDefaultTickets();
      }
      return ESCALATED_TICKETS;
    }
    const list: EscalatedTicket[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EscalatedTicket);
    });
    return list;
  } catch (error) {
    console.warn('Falling back to default tickets:', error);
    return ESCALATED_TICKETS;
  }
}

export async function seedDefaultTickets() {
  const path = 'tickets';
  if (!auth.currentUser) {
    return;
  }

  try {
    for (const ticket of ESCALATED_TICKETS) {
      const sanitizedTicket = {
        id: ticket.id,
        farmerName: ticket.farmerName,
        farmerPhone: ticket.farmerPhone || '',
        farmerId: auth.currentUser.uid,
        region: ticket.region || '',
        country: ticket.country || '',
        flag: ticket.flag || '',
        crop: ticket.crop,
        photoUrl: ticket.photoUrl || '',
        aiSuggestedCondition: ticket.aiSuggestedCondition || '',
        confidenceScore: ticket.confidenceScore || 0,
        triageReason: ticket.triageReason || '',
        status: ticket.status || 'PENDING_REVIEW',
        agronomistNotes: ticket.agronomistNotes || '',
        prescribedTreatment: ticket.prescribedTreatment || '',
        timestamp: ticket.timestamp || new Date().toISOString(),
        createdAt: ticket.timestamp || new Date().toISOString(),
      };
      await setDoc(doc(db, path, ticket.id), sanitizedTicket, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore ticket seeding notice:', error);
  }
}

export async function updateTicketInFirestore(ticketId: string, updates: Partial<EscalatedTicket>): Promise<void> {
  const path = `tickets/${ticketId}`;
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createTicketInFirestore(ticket: EscalatedTicket): Promise<void> {
  const path = 'tickets';
  try {
    await setDoc(doc(db, path, ticket.id), {
      ...ticket,
      farmerId: auth.currentUser?.uid || ticket.id,
      createdAt: ticket.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 4. OUTBREAKS SERVICE
export async function getOutbreaksFromFirestore(): Promise<OutbreakReport[]> {
  const path = 'outbreaks';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      if (auth.currentUser) {
        await seedDefaultOutbreaks();
      }
      return OUTBREAK_REPORTS;
    }
    const list: OutbreakReport[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as OutbreakReport);
    });
    return list;
  } catch (error) {
    console.warn('Falling back to default outbreaks:', error);
    return OUTBREAK_REPORTS;
  }
}

export async function seedDefaultOutbreaks() {
  const path = 'outbreaks';
  if (!auth.currentUser) {
    return;
  }

  try {
    for (const report of OUTBREAK_REPORTS) {
      const sanitizedOutbreak = {
        id: report.id,
        country: report.country,
        flag: report.flag || '',
        region: report.region || '',
        crop: report.crop,
        pestDisease: report.pestDisease,
        severity: report.severity || 'Moderate',
        sporeDensityIndex: report.sporeDensityIndex || 0,
        distanceToBorderKm: report.distanceToBorderKm || 0,
        neighboringCountry: report.neighboringCountry || '',
        verifiedBy: report.verifiedBy || '',
        date: report.date || new Date().toISOString(),
        reportedAt: report.date || new Date().toISOString(),
      };
      await setDoc(doc(db, path, report.id), sanitizedOutbreak, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore outbreak seeding notice:', error);
  }
}

export async function createOutbreakReportInFirestore(report: OutbreakReport): Promise<void> {
  const path = 'outbreaks';
  try {
    await setDoc(doc(db, path, report.id), {
      ...report,
      reportedAt: report.date || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 5. USER PROFILES SERVICE
export async function saveUserProfileToFirestore(profile: FarmerProfile): Promise<void> {
  const path = `users/${profile.id}`;
  if (!auth.currentUser) {
    return;
  }

  try {
    await setDoc(
      doc(db, 'users', profile.id),
      {
        id: profile.id,
        name: profile.farmerName,
        email: profile.phoneOrEmail || `${profile.id}@brics-agrinet.org`,
        role: profile.role || 'farmer',
        country: profile.country,
        farmLocation: profile.region || '',
        cropFocus: profile.cropFocus || '',
        language: profile.language || 'en',
        createdAt: profile.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<FarmerProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as FarmerProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}


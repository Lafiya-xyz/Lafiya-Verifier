/** The minimal, decision-relevant record shown on a patient's public emergency page. */
export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  photoUrl?: string;
  bloodGroup: BloodGroup;
  genotype: Genotype;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  language: string;
}

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Genotype = "AA" | "AS" | "SS" | "AC" | "SC" | "CC";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/** A community health worker authorized to attest patient records. */
export interface CommunityHealthWorker {
  id: string;
  stellarPublicKey: string;
  fullName: string;
  licenseNumber: string;
  allowlisted: boolean;
}

/** The on-chain attestation payload — a hash of the record, never the record itself. */
export interface Attestation {
  recordId: string;
  recordHash: string;
  attesterPublicKey: string;
  timestamp: number;
  transactionHash?: string;
}

export type AttestationStatus = "pending" | "submitted" | "confirmed" | "failed";

/** A queued USDC incentive payout owed to a CHW for a confirmed attestation. */
export interface PayoutRecord {
  id: string;
  chwId: string;
  attestationRecordId: string;
  amountUsdc: number;
  status: "queued" | "sent" | "failed";
  createdAt: number;
}

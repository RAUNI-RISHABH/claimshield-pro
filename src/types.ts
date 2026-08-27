export type UserRole = 'claimer' | 'validator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department?: string;
  avatar: string;
  policyNumber?: string;
}

export type ClaimerView = 'upload' | 'history';
export type ValidatorView = 'queue' | 'report' | 'analytics';

export type ClaimStatus = 'pending' | 'succeeded' | 'rejected' | 'approved' | 'in_review';

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  size?: string;
  required: boolean;
  status: 'empty' | 'uploading' | 'uploaded' | 'verified_agent' | 'verification_failed';
  fileName?: string;
  fileSize?: string;
  progress?: number;
  error?: string;
  imageUrl?: string;
  iconName: string;
}

export interface ClaimRecord {
  id: string;
  claimerName: string;
  carPolicy: string;
  submissionDate: string;
  incidentDate?: string;
  incidentLocation?: string;
  vehicle: string;
  vin?: string;
  repairEstimate: number;
  deductible: number;
  potentialPayout: number;
  docsUploaded: number;
  docsTotal: number;
  status: ClaimStatus;
  statusLabel: string;
  diagnosisCode?: string;
  aiSummary: {
    damageAssessment: string;
    damageVerified: boolean;
    policyMatching: string;
    policyActive: boolean;
    fraudScore: number;
    fraudLabel: string;
  };
  financialBreakdown: {
    originalEstimate: number;
    deductible: number;
    consumables?: number;
    approvedAmount: number;
  };
  validatorRemarks?: string;
  expectedPayoutDate?: string;
  documents: DocumentItem[];
}

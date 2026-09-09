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

export interface StoredFileInfo {
  filename: string;
  size_bytes: number;
  content_type: string;
  category: 'vehicle_pics' | 'other_evidence' | string;
  blob_path: string;
  blob_url: string;
  sha256?: string;
}

export interface StorageDetails {
  backend: string;
  container: string;
  base_folder: string;
  vehicle_pics_folder: string;
  other_evidence_folder: string;
}

export interface ClaimDetails {
  claim_id: string;
  user_name?: string;
  folder_name: string;
  time_created: string;
  iso_timestamp: string;
  status: string;
  description: string;
  total_files_uploaded: number;
  vehicle_pics_count: number;
  other_evidence_count: number;
  storage_details: StorageDetails;
  vehicle_pics: StoredFileInfo[];
  other_evidence: StoredFileInfo[];
  saved_metadata_path?: string;
}

export type GetAllClaimsResponse = ClaimDetails[];


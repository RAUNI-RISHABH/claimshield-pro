import { ClaimRecord, DocumentItem } from '../types';
import { INITIAL_CLAIMS } from '../data';

export interface ValidatorQueueParams {
  statusFilter?: 'all' | 'pending' | 'succeeded' | 'rejected';
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export interface ValidatorDecisionPayload {
  claimId: string;
  deductible?: number;
  notes: string;
  adjusterId?: string;
}

export interface ValidatorDecisionResponse {
  success: boolean;
  claimId: string;
  status: 'approved' | 'rejected' | 'pending';
  approvedAmount?: number;
  message: string;
  timestamp: string;
}

export interface AiVerificationResponse {
  success: boolean;
  claimId: string;
  aiSummary: {
    damageAssessment: string;
    damageVerified: boolean;
    policyMatching: string;
    policyActive: boolean;
    fraudScore: number;
    fraudLabel: string;
  };
  documents: DocumentItem[];
  message: string;
}

/**
 * Validator API: Fetch filterable and searchable claims queue listing.
 */
export async function fetchValidatorQueue(
  params?: ValidatorQueueParams
): Promise<{ claims: ClaimRecord[]; totalCount: number }> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  let filtered = [...INITIAL_CLAIMS];

  if (params?.statusFilter && params.statusFilter !== 'all') {
    if (params.statusFilter === 'pending') {
      filtered = filtered.filter((c) => c.status === 'pending');
    } else if (params.statusFilter === 'succeeded') {
      filtered = filtered.filter((c) => c.status === 'succeeded' || c.status === 'approved');
    } else if (params.statusFilter === 'rejected') {
      filtered = filtered.filter((c) => c.status === 'rejected');
    }
  }

  if (params?.searchQuery && params.searchQuery.trim()) {
    const q = params.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.claimerName.toLowerCase().includes(q) ||
        c.carPolicy.toLowerCase().includes(q)
    );
  }

  return {
    claims: filtered,
    totalCount: filtered.length,
  };
}

/**
 * Validator API: Fetch single claim report details for Auto Collision review.
 */
export async function fetchCollisionReport(claimId: string): Promise<ClaimRecord | null> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const found = INITIAL_CLAIMS.find((c) => c.id === claimId);
  return found || null;
}

/**
 * Validator API: Trigger automated deep AI verification pipeline.
 */
export async function processAiVerificationApi(
  claimId: string
): Promise<AiVerificationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    claimId,
    aiSummary: {
      damageAssessment: 'Frontal Bumper & Radiator Assembly (AI Re-Verified)',
      damageVerified: true,
      policyMatching: 'Comprehensive Auto Shield (Verified)',
      policyActive: true,
      fraudScore: 6,
      fraudLabel: 'Low Risk (6/100)',
    },
    documents: [
      {
        id: 'doc-1',
        title: 'Front_Bumper_Damage.jpg',
        category: 'Car Photos',
        size: '2.4 MB',
        required: true,
        status: 'verified_agent',
        fileName: 'Front_Bumper_Damage.jpg',
        fileSize: '2.4 MB',
        iconName: 'image',
      },
      {
        id: 'doc-2',
        title: 'Police_Report_SPD.pdf',
        category: 'Police Report',
        size: '1.1 MB',
        required: true,
        status: 'verified_agent',
        fileName: 'Police_Report_SPD.pdf',
        fileSize: '1.1 MB',
        iconName: 'description',
      },
    ],
    message: `Automated AI integrity analysis complete for ${claimId}. Evidence verified.`,
  };
}

/**
 * Validator API: Approve claim and authorize payout.
 */
export async function approveClaimApi(
  payload: ValidatorDecisionPayload
): Promise<ValidatorDecisionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    claimId: payload.claimId,
    status: 'approved',
    message: `Claim ${payload.claimId} approved by adjuster. Payout queued for disbursement.`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validator API: Reject claim with adjuster rationale.
 */
export async function rejectClaimApi(
  payload: ValidatorDecisionPayload
): Promise<ValidatorDecisionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    claimId: payload.claimId,
    status: 'rejected',
    message: `Claim ${payload.claimId} rejected and closed in adjuster queue.`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validator API: Request documentation resubmission from policyholder.
 */
export async function requestMoreInfoApi(
  payload: ValidatorDecisionPayload
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: `Information request dispatched to policyholder for claim ${payload.claimId}.`,
  };
}

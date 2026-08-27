import { ClaimRecord, DocumentItem } from '../types';
import { INITIAL_CLAIMS } from '../data';

export interface DocumentUploadPayload {
  claimId: string;
  category: 'car pics' | 'police report' | 'driving license' | 'repair estimate' | 'third party' | 'towing receipt' | string;
  file: File;
  metadata?: {
    slotId?: string;
    description?: string;
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  category: string;
  fileName: string;
  fileSize: string;
  message: string;
  error?: string;
  ocrExtractedData?: {
    vinDetected?: string;
    damageArea?: string;
    documentType?: string;
    issuingAuthority?: string;
    totalAmount?: number;
  };
  uploadedAt: string;
}

export interface CreateClaimPayload {
  claimId: string;
  claimerName: string;
  carPolicy: string;
  vehicle: string;
  incidentDate: string;
  incidentLocation: string;
  repairEstimate: number;
  documents: {
    category: string;
    fileName: string;
    size: string;
  }[];
}

export interface SubmitClaimResponse {
  success: boolean;
  claim: ClaimRecord;
  message: string;
  submissionTimestamp: string;
}

/**
 * SINGLE UNIFIED API for all document upload and validation checks.
 * Backend differentiates processing via the `payload.category` property.
 * e.g., 'car pics' triggers computer vision inspection,
 * while 'police report', 'repair estimate', etc. trigger OCR parser.
 */
export async function uploadAndValidateDocument(
  payload: DocumentUploadPayload
): Promise<DocumentUploadResponse> {
  const { category, file, claimId } = payload;
  const fileName = file.name;
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  // Simulate network latency for file transmission & server-side inspection
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerName = fileName.toLowerCase();

  // 1. CAR PICS category inspection
  if (category === 'car pics') {
    // Check if image format is supported
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(fileName);
    if (!isImage && !lowerName.endsWith('.pdf')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'Invalid file format. Vehicle photos must be JPEG, PNG, WEBP, or PDF.',
        message: 'Validation failed during format check.',
        uploadedAt: new Date().toISOString(),
      };
    }

    // Simulate image quality / lighting validation error if name suggests defect
    if (lowerName.includes('dark') || lowerName.includes('blur') || lowerName.includes('corrupt')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error:
          'Vision AI Alert: Image resolution is too dark or VIN plate obscured. Please upload a clear, well-lit photo showing damage and vehicle stamp.',
        message: 'Vision AI flagged low lighting.',
        uploadedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      category,
      fileName,
      fileSize: fileSizeMb,
      message: '✓ Vision AI verified: Frontal bumper damage confirmed & VIN verified against POL-882.',
      ocrExtractedData: {
        vinDetected: '4T1B11HK2LU889YYY',
        damageArea: 'Front Bumper / Hood',
        documentType: 'Vehicle Damage Photo',
      },
      uploadedAt: new Date().toISOString(),
    };
  }

  // 2. POLICE FIR / REPORT category inspection
  if (category === 'police report') {
    if (lowerName.includes('unsigned') || lowerName.includes('draft')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'OCR Error: Missing police precinct seal or officer badge signature in Section 4.',
        message: 'Police report validation failed.',
        uploadedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      category,
      fileName,
      fileSize: fileSizeMb,
      message: '✓ OCR Verified: Police FIR Report verified with valid seal and collision incident log.',
      ocrExtractedData: {
        issuingAuthority: 'Seattle Police Dept - West Precinct',
        documentType: 'Accident FIR Summary',
      },
      uploadedAt: new Date().toISOString(),
    };
  }

  // 3. DRIVING LICENSE & RC category inspection
  if (category === 'driving license') {
    if (lowerName.includes('expired')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'Document Alert: Driving license appears expired or does not match primary policyholder.',
        message: 'License validation error.',
        uploadedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      category,
      fileName,
      fileSize: fileSizeMb,
      message: '✓ Identity Verified: Driver license & vehicle RC registration active through 2027.',
      ocrExtractedData: {
        documentType: 'State Driving License & RC',
      },
      uploadedAt: new Date().toISOString(),
    };
  }

  // 4. REPAIR ESTIMATE category inspection
  if (category === 'repair estimate') {
    if (lowerName.includes('mismatch') || lowerName.includes('fake')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'Invoice Audit Alert: Tax identification number and certified labor rate mismatch.',
        message: 'Estimate audit error.',
        uploadedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      category,
      fileName,
      fileSize: fileSizeMb,
      message: '✓ Estimate Verified: Garage line-items validated within regional standardized labor bands.',
      ocrExtractedData: {
        totalAmount: 1450.0,
        documentType: 'Itemized Certified Repair Quote',
      },
      uploadedAt: new Date().toISOString(),
    };
  }

  // 5. THIRD-PARTY & TOWING (Optional categories)
  return {
    success: true,
    category,
    fileName,
    fileSize: fileSizeMb,
    message: `✓ Document received & encrypted for ${category}.`,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Claimer API: Submit finalized claim for underwriting and validator queue.
 */
export async function submitClaimApi(
  payload: CreateClaimPayload
): Promise<SubmitClaimResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 900));

  const newClaim: ClaimRecord = {
    id: payload.claimId || `#CLM-${Math.floor(1000 + Math.random() * 9000)}`,
    claimerName: payload.claimerName || 'Jane Doe',
    carPolicy: payload.carPolicy || 'POL-882',
    submissionDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    incidentDate: payload.incidentDate || 'Oct 24, 2024, 11:30 AM',
    incidentLocation: payload.incidentLocation || 'Pine & 6th Ave, Seattle, WA',
    vehicle: payload.vehicle || '2020 Toyota Camry',
    vin: '4T1B11HK2LU889YYY',
    repairEstimate: payload.repairEstimate || 1450.0,
    deductible: 200.0,
    potentialPayout: Math.max(0, (payload.repairEstimate || 1450.0) - 200.0),
    docsUploaded: payload.documents.length,
    docsTotal: 6,
    status: 'pending',
    statusLabel: 'Pending',
    diagnosisCode: 'J01.90 (Bumper / Hood Dent)',
    aiSummary: {
      damageAssessment: 'Front Bumper Scrape & Dent',
      damageVerified: true,
      policyMatching: 'Comprehensive Auto Shield',
      policyActive: true,
      fraudScore: 8,
      fraudLabel: 'Low Risk (8/100)',
    },
    financialBreakdown: {
      originalEstimate: payload.repairEstimate || 1450.0,
      deductible: 200.0,
      consumables: 0.0,
      approvedAmount: Math.max(0, (payload.repairEstimate || 1450.0) - 200.0),
    },
    validatorRemarks: 'Awaiting primary adjuster sign-off.',
    expectedPayoutDate: 'Pending Review',
    documents: payload.documents.map((d, idx) => ({
      id: `doc-${idx + 1}`,
      title: d.fileName,
      category: d.category,
      size: d.size,
      required: true,
      status: 'verified_agent',
      fileName: d.fileName,
      fileSize: d.size,
      iconName: 'description',
    })),
  };

  return {
    success: true,
    claim: newClaim,
    message: `Claim ${newClaim.id} submitted successfully and assigned to Motor Claims Division.`,
    submissionTimestamp: new Date().toISOString(),
  };
}

/**
 * Claimer API: Fetch listing of policyholder's claims.
 */
export async function fetchClaimerClaims(userId: string): Promise<ClaimRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return INITIAL_CLAIMS;
}

/**
 * Claimer API: Save draft claim progress.
 */
export async function saveDraftClaimApi(draft: Partial<ClaimRecord>): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    success: true,
    message: 'Draft claim saved securely in cloud repository. You can resume anytime.',
  };
}

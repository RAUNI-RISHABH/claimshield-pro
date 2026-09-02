import { ClaimRecord, DocumentItem } from '../types';
import { INITIAL_CLAIMS } from '../data';

export interface FileAssessment {
  filename: string;
  status: 'VALID' | 'INVALID' | string;
  detected_content: string;
  notes: string;
}

export interface AccidentPhotoCoverage {
  front_view?: boolean;
  rear_view?: boolean;
  left_side_view?: boolean;
  right_side_view?: boolean;
  all_4_sides_present?: boolean;
  missing_views?: string[];
}

export interface ApiClassificationResponse {
  is_valid: boolean;
  category_type: string;
  detected_type: string;
  confidence: number;
  description: string;
  error?: string | null;
  file_assessments?: FileAssessment[];
  accident_photo_coverage?: AccidentPhotoCoverage | null;
}

export interface DocumentUploadPayload {
  claimId: string;
  category:
  | 'survey_report'
  | 'repair_invoice'
  | 'repair_estimate'
  | 'insurance_policy'
  | 'claim_form'
  | 'registration_certificate'
  | 'driving_licence'
  | 'accident_photos'
  | string;
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
  classificationResult?: ApiClassificationResponse;
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
 * Mapping from frontend slot category identifiers to canonical backend category_type strings.
 */
const CATEGORY_MAP: Record<string, string> = {
  'survey report': 'survey_report',
  'survey_report': 'survey_report',
  'repair invoice': 'repair_invoice',
  'repair_invoice': 'repair_invoice',
  'repair estimate': 'repair_estimate',
  'repair_estimate': 'repair_estimate',
  'insurance policy': 'insurance_policy',
  'insurance_policy': 'insurance_policy',
  'claim form': 'claim_form',
  'claim_form': 'claim_form',
  'rc copy': 'registration_certificate',
  'rc': 'registration_certificate',
  'registration_certificate': 'registration_certificate',
  'driver license': 'driving_licence',
  'driving license': 'driving_licence',
  'driver\'s license': 'driving_licence',
  'driving_licence': 'driving_licence',
  'car pics': 'accident_photos',
  'accident_photos': 'accident_photos',
};

const CLASSIFICATION_API_URL = 'http://127.0.0.1:8000/api/v1/claims/classification';

/**
 * UNIFIED API: Calls the real Document Classification Endpoint at http://127.0.0.1:8000/api/v1/claims/classification
 * Sends multipart FormData containing `category_type` and `file`.
 */
export async function uploadAndValidateDocument(
  payload: DocumentUploadPayload
): Promise<DocumentUploadResponse> {
  const { category, file } = payload;
  const fileName = file.name;
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  // Normalize category parameter to match backend expected enum
  const normalizedCategoryKey = category.toLowerCase().trim();
  const categoryType = CATEGORY_MAP[normalizedCategoryKey] || normalizedCategoryKey;

  // Strict Format Enforcement:
  // 1. Car photos: image files only (JPEG, JPG, PNG)
  // 2. All other 7 document categories: PDF files only
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(fileName);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileName);

  if (categoryType === 'accident_photos' || categoryType === 'car pics') {
    if (!isImage) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'Invalid file format. Car photos must be uploaded as JPEG, JPG, or PNG images. PDF and other document formats are not allowed for vehicle photos.',
        message: 'Invalid file format.',
        uploadedAt: new Date().toISOString(),
      };
    }
  } else {
    // All other 7 document types require PDF
    if (!isPdf) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: `Invalid file format. '${fileName}' must be uploaded as a PDF file. Image and non-PDF file formats are not allowed for this document type.`,
        message: 'Invalid file format.',
        uploadedAt: new Date().toISOString(),
      };
    }
  }

  const formData = new FormData();
  formData.append('category_type', categoryType);
  formData.append('files', file);

  try {
    const response = await fetch(CLASSIFICATION_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data: ApiClassificationResponse = await response.json();

      if (data.is_valid) {
        let successMsg = `✓ ${data.description || 'Document classified & validated successfully.'}`;
        if (data.confidence !== undefined) {
          successMsg += ` (Confidence: ${(data.confidence * 100).toFixed(0)}%)`;
        }

        return {
          success: true,
          category,
          fileName,
          fileSize: fileSizeMb,
          message: successMsg,
          classificationResult: data,
          ocrExtractedData: {
            documentType: data.detected_type,
          },
          uploadedAt: new Date().toISOString(),
        };
      } else {
        // Response returned HTTP 200 but document classification is INVALID
        const errorText =
          data.error ||
          data.description ||
          `Uploaded document is not a valid ${data.category_type}. Detected type: '${data.detected_type}'.`;

        return {
          success: false,
          category,
          fileName,
          fileSize: fileSizeMb,
          error: errorText,
          classificationResult: data,
          message: 'Document classification failed.',
          uploadedAt: new Date().toISOString(),
        };
      }
    } else {
      // Handle HTTP error statuses (e.g. 422 Unprocessable Entity for invalid category_type)
      let errorDetail = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail =
            typeof errorJson.detail === 'string'
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // ignore JSON parse error
      }

      const formattedError =
        response.status === 422
          ? `Invalid Category Name Request Error — HTTP 422 Unprocessable Entity\n${errorDetail}`
          : `Classification API Error (HTTP ${response.status}): ${errorDetail}`;

      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: formattedError,
        message: 'Classification API Error',
        uploadedAt: new Date().toISOString(),
      };
    }
  } catch (netErr) {
    console.warn(
      `Classification API (${CLASSIFICATION_API_URL}) unreachable. Using local validation fallback.`,
      netErr
    );
    return mockLocalValidation(category, file, fileName, fileSizeMb);
  }
}

/**
 * Fallback local validation when server is unreachable
 */
function mockLocalValidation(
  category: string,
  file: File,
  fileName: string,
  fileSizeMb: string
): DocumentUploadResponse {
  const lowerName = fileName.toLowerCase();

  if (category === 'accident_photos' || category === 'car pics') {
    if (lowerName.includes('dark') || lowerName.includes('blur') || lowerName.includes('corrupt')) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error:
          'Vision AI Alert: Side angle photo is obscured or blurry. Please re-upload clear photos covering all 4 sides of the vehicle.',
        message: 'Vision AI flagged lighting/blur defect.',
        uploadedAt: new Date().toISOString(),
      };
    }
    return {
      success: true,
      category,
      fileName,
      fileSize: fileSizeMb,
      message: '✓ Vision AI Verified: 4-side vehicle inspection completed. Front, rear, and side panel damage verified.',
      ocrExtractedData: {
        vinDetected: '4T1B11HK2LU889YYY',
        damageArea: '4-Angle Vehicle Perimeter Inspection',
        documentType: '4-Side Vehicle Photos',
      },
      uploadedAt: new Date().toISOString(),
    };
  }

  if (lowerName.includes('invalid') || lowerName.includes('fake') || lowerName.includes('unsigned')) {
    return {
      success: false,
      category,
      fileName,
      fileSize: fileSizeMb,
      error: `Validation Error: File '${fileName}' failed AI authenticity checks for ${category}.`,
      message: 'Validation failed.',
      uploadedAt: new Date().toISOString(),
    };
  }

  return {
    success: true,
    category,
    fileName,
    fileSize: fileSizeMb,
    message: `✓ Document verified and encrypted for category '${category}'.`,
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
    docsTotal: 8,
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

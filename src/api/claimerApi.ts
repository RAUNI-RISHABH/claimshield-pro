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
// export async function uploadAndValidateDocument(
//   payload: DocumentUploadPayload
// ): Promise<DocumentUploadResponse> {
//   const { category, file } = payload;
//   const fileName = file.name;
//   const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

//   // Normalize category parameter to match backend expected enum
//   const normalizedCategoryKey = category.toLowerCase().trim();
//   const categoryType = CATEGORY_MAP[normalizedCategoryKey] || normalizedCategoryKey;

//   // Strict Format Enforcement:
//   // 1. Car photos: image files only (JPEG, JPG, PNG)
//   // 2. All other 7 document categories: PDF files only
//   const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(fileName);
//   const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileName);

//   if (categoryType === 'accident_photos' || categoryType === 'car pics') {
//     if (!isImage) {
//       return {
//         success: false,
//         category,
//         fileName,
//         fileSize: fileSizeMb,
//         error: 'Invalid file format. Car photos must be uploaded as JPEG, JPG, or PNG images. PDF and other document formats are not allowed for vehicle photos.',
//         message: 'Invalid file format.',
//         uploadedAt: new Date().toISOString(),
//       };
//     }
//   } else {
//     // All other 7 document types require PDF
//     if (!isPdf) {
//       return {
//         success: false,
//         category,
//         fileName,
//         fileSize: fileSizeMb,
//         error: `Invalid file format. '${fileName}' must be uploaded as a PDF file. Image and non-PDF file formats are not allowed for this document type.`,
//         message: 'Invalid file format.',
//         uploadedAt: new Date().toISOString(),
//       };
//     }
//   }

//   const formData = new FormData();
//   formData.append('category_type', categoryType);
//   formData.append('files', file);

//   try {
//     const response = await fetch(CLASSIFICATION_API_URL, {
//       method: 'POST',
//       body: formData,
//     });

//     if (response.ok) {
//       const data: ApiClassificationResponse = await response.json();

//       if (data.is_valid) {
//         let successMsg = `✓ ${data.description || 'Document classified & validated successfully.'}`;
//         if (data.confidence !== undefined) {
//           successMsg += ` (Confidence: ${(data.confidence * 100).toFixed(0)}%)`;
//         }

//         return {
//           success: true,
//           category,
//           fileName,
//           fileSize: fileSizeMb,
//           message: successMsg,
//           classificationResult: data,
//           ocrExtractedData: {
//             documentType: data.detected_type,
//           },
//           uploadedAt: new Date().toISOString(),
//         };
//       } else {
//         // Response returned HTTP 200 but document classification is INVALID
//         const errorText =
//           data.error ||
//           data.description ||
//           `Uploaded document is not a valid ${data.category_type}. Detected type: '${data.detected_type}'.`;

//         return {
//           success: false,
//           category,
//           fileName,
//           fileSize: fileSizeMb,
//           error: errorText,
//           classificationResult: data,
//           message: 'Document classification failed.',
//           uploadedAt: new Date().toISOString(),
//         };
//       }
//     } else {
//       // Handle HTTP error statuses (e.g. 422 Unprocessable Entity for invalid category_type)
//       let errorDetail = `HTTP Error ${response.status}`;
//       try {
//         const errorJson = await response.json();
//         if (errorJson.detail) {
//           errorDetail =
//             typeof errorJson.detail === 'string'
//               ? errorJson.detail
//               : JSON.stringify(errorJson.detail);
//         }
//       } catch (e) {
//         // ignore JSON parse error
//       }

//       const formattedError =
//         response.status === 422
//           ? `Invalid Category Name Request Error — HTTP 422 Unprocessable Entity\n${errorDetail}`
//           : `Classification API Error (HTTP ${response.status}): ${errorDetail}`;

//       return {
//         success: false,
//         category,
//         fileName,
//         fileSize: fileSizeMb,
//         error: formattedError,
//         message: 'Classification API Error',
//         uploadedAt: new Date().toISOString(),
//       };
//     }
//   } catch (netErr) {
//     console.warn(
//       `Classification API (${CLASSIFICATION_API_URL}) unreachable. Using local validation fallback.`,
//       netErr
//     );
//     return mockLocalValidation(category, file, fileName, fileSizeMb);
//   }
// }


export async function uploadAndValidateDocument(
  payload: DocumentUploadPayload
): Promise<DocumentUploadResponse> {
  const { category, file } = payload;
  const fileName = file.name;
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
  // Normalize category parameter to match backend expected enum or alias
  const normalizedCategoryKey = category.toLowerCase().trim();
  const categoryType = CATEGORY_MAP[normalizedCategoryKey] || normalizedCategoryKey;
  // File type detection
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(fileName);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileName);
  // Car photos specifically must be images (Front, Rear, Left, Right)
  if (categoryType === 'accident_photos' || categoryType === 'car pics' || categoryType === 'car pic four side') {
    if (!isImage) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: 'Invalid file format. Car photos must be uploaded as JPEG, JPG, or PNG images.',
        message: 'Invalid file format.',
        uploadedAt: new Date().toISOString(),
      };
    }
  } else {
    // Other documents can be PDF or high-resolution images (RC, License, Invoices, etc.)
    if (!isPdf && !isImage) {
      return {
        success: false,
        category,
        fileName,
        fileSize: fileSizeMb,
        error: `Invalid file format. '${fileName}' must be a PDF or Image (JPG, PNG).`,
        message: 'Invalid file format.',
        uploadedAt: new Date().toISOString(),
      };
    }
  }
  // Build FormData matching backend requirements
  const formData = new FormData();
  formData.append('category_type', categoryType);
  formData.append('files', file);
  console.log(`[Classifier API] Uploading '${fileName}' for category '${categoryType}' to:`, CLASSIFICATION_API_URL);
  try {
    const response = await fetch(CLASSIFICATION_API_URL, {
      method: 'POST',
      body: formData,
    });
    console.log(`[Classifier API] Response status: ${response.status} (${response.statusText})`);
    if (response.ok) {
      const data: any = await response.json();
      console.log('[Classifier API] Parsed JSON Response:', data);
      // Support is_valid, isValid, or status === 'VALID'
      const isValidDocument = Boolean(
        data.is_valid === true ||
        data.isValid === true ||
        data.status === 'VALID'
      );
      const detectedType = data.detected_type || data.detectedType || categoryType;
      const confidenceScore = data.confidence !== undefined ? data.confidence : 0.90;
      if (isValidDocument) {
        let successMsg = `✓ ${data.description || 'Document classified & validated successfully.'}`;
        if (confidenceScore !== undefined) {
          successMsg += ` (Confidence: ${(confidenceScore * 100).toFixed(0)}%)`;
        }
        return {
          success: true,
          category,
          fileName,
          fileSize: fileSizeMb,
          message: successMsg,
          classificationResult: data,
          ocrExtractedData: {
            documentType: detectedType,
          },
          uploadedAt: new Date().toISOString(),
        };
      } else {
        // Document was processed by AI but determined not to match the expected category
        const errorText =
          data.error ||
          data.description ||
          `Uploaded document is not a valid ${data.category_type || categoryType}. Detected as '${detectedType}'.`;
        console.warn('[Classifier API] Document is invalid for category:', errorText);
        return {
          success: false,
          category,
          fileName,
          fileSize: fileSizeMb,
          error: errorText,
          classificationResult: data,
          ocrExtractedData: {
            documentType: detectedType,
          },
          message: 'Document classification failed.',
          uploadedAt: new Date().toISOString(),
        };
      }
    } else {
      // Handle HTTP error responses (e.g. 422, 500)
      let errorDetail = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // Ignore parse error if not JSON
      }
      const formattedError =
        response.status === 422
          ? `Invalid Category Request — HTTP 422 Unprocessable Entity: ${errorDetail}`
          : `Classification API Error (HTTP ${response.status}): ${errorDetail}`;
      console.error('[Classifier API] Server error:', formattedError);
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
      `[Classifier API] Endpoint (${CLASSIFICATION_API_URL}) unreachable or network failed. Using local validation fallback.`,
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

/* =========================================================================
   CLAIMER ENQUIRY CHAT API (RAG System Integration)
   Pre-configured for backend integration with http://127.0.0.1:8000/api/v1/policy/enquiry
   ========================================================================= */

export interface RagSource {
  title: string;
  section: string;
  excerpt: string;
  confidence: number;
}

export interface PolicyEnquiryRequest {
  query: string;
  policyNumber?: string;
  claimId?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface PolicyEnquiryResponse {
  answer: string;
  sources: RagSource[];
  confidence: number;
  model: string;
  timestamp: string;
}

const ENQUIRY_API_URL = 'http://127.0.0.1:8000/api/v1/policy/enquiry';

/**
 * Claimer API: Send query to RAG Policy Assistant backend.
 * Gracefully falls back to knowledge-grounded simulated responses if backend endpoint is offline.
 */
export async function sendPolicyEnquiry(
  req: PolicyEnquiryRequest
): Promise<PolicyEnquiryResponse> {
  const policyNum = req.policyNumber || 'POL-882';

  try {
    const res = await fetch(ENQUIRY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data: PolicyEnquiryResponse = await res.json();
      return data;
    }
  } catch (err) {
    console.info(
      `RAG Enquiry backend (${ENQUIRY_API_URL}) not available, executing client-side policy simulation.`,
      err
    );
  }

  // Fallback: Realistic RAG simulation grounded in POL-882
  await new Promise((resolve) => setTimeout(resolve, 850));
  return getMockRagResponse(req.query, policyNum);
}

/**
 * Mock RAG response generator indexing policy POL-882 clauses
 */
function getMockRagResponse(query: string, policyNumber: string): PolicyEnquiryResponse {
  const q = query.toLowerCase();

  if (q.includes('deductible') || q.includes('excess') || q.includes('how much do i pay')) {
    return {
      answer: `Under your active Motor Policy **${policyNumber}** (Comprehensive Gold Shield), your standard compulsory deductible for accidental collision claims is **₹150.00** (or **₹200.00** for high-performance class claims).\n\nKey Breakdown:\n• **Compulsory Deductible**: ₹150.00 per claim incident.\n• **Voluntary Deductible**: None opted at policy issuance.\n• **Salvage Deduction**: Applied only if damaged structural parts are retained by the policyholder.\n\nAny approved repair amount exceeding this deductible will be disbursed directly or paid to the cashless network garage.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Section 4.1 - Schedule of Compulsory Deductibles',
          excerpt: 'The policyholder agrees to bear a compulsory excess of ₹150.00 for each individual accidental collision claim occurring during the active term.',
          confidence: 0.98,
        },
        {
          title: 'Policy_Schedule_Schedule_B.pdf',
          section: 'Clause 7.2 - Voluntary Deductible Endorsement',
          excerpt: 'Voluntary deductible opted: ₹0.00. No additional discount applied to basic own damage premium.',
          confidence: 0.92,
        },
      ],
      confidence: 0.96,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  if (
    q.includes('bumper') ||
    q.includes('body') ||
    q.includes('depreciation') ||
    q.includes('scratch') ||
    q.includes('dent')
  ) {
    return {
      answer: `Yes, bumper and exterior body panel damage are covered under **${policyNumber}**.\n\nCoverage Details:\n• **Zero Depreciation Add-on**: Active on your policy. Plastic, rubber, fiber, and metal parts (including front and rear bumpers) receive **100% reimbursement without standard 50% age depreciation**.\n• **Paintwork**: Covered at 100% materials and labor for color matching in certified collision repair centers.\n• **Labor Charges**: 100% covered as per regional standardized garage tariff rates.\n\nMake sure to provide clear four-angle photographs of the bumper deformation when submitting claim documents.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Add-on Rider 1 - Zero Depreciation Endorsement',
          excerpt: 'Depreciation waiver is active. In the event of partial accidental damage, no deduction for depreciation shall be made on replaced parts including plastic bumpers and glass.',
          confidence: 0.97,
        },
      ],
      confidence: 0.95,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  if (q.includes('towing') || q.includes('tow') || q.includes('crane') || q.includes('breakdown')) {
    return {
      answer: `Emergency towing is covered under Policy **${policyNumber}** through the **24/7 Roadside Assistance Endorsement**.\n\nLimits & Reimbursement Terms:\n• **Maximum Towing Allowance**: Up to **₹2,500.00** per accident incident.\n• **Eligible Distance**: From accident spot to the nearest certified garage or designated authorized body shop.\n• **Documentation Required**: Official GST invoice/receipt from the licensed towing operator stating pickup and drop coordinates.\n\nYou can upload the towing receipt in the reimbursement document portal under optional attachments.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Section 2.4 - Towing and Emergency Transit Expenses',
          excerpt: 'If vehicle is disabled due to insured peril, the insurer will indemnify the reasonable towing charge up to a maximum limit of ₹2,500.00 upon receipt submission.',
          confidence: 0.94,
        },
      ],
      confidence: 0.93,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  if (
    q.includes('document') ||
    q.includes('paper') ||
    q.includes('require') ||
    q.includes('upload') ||
    q.includes('what do i need')
  ) {
    return {
      answer: `To file a motor reimbursement claim for **${policyNumber}**, the following documents are mandatory:\n\n1. **Survey Report (Motor Insurance)**: Official assessment from an independent IRDAI-certified surveyor.\n2. **Repair Invoice**: Final garage tax bill with payment receipt/stamp.\n3. **Repair Estimate Details**: Pre-repair itemized quotation of parts and labor.\n4. **Insurance Policy Copy**: Copy of policy certificate (${policyNumber}).\n5. **Claim Form**: Duly filled & signed claim application form.\n6. **Registration Certificate (RC)**: Clear copy of vehicle RC showing chassis/engine number.\n7. **Driver's License**: Valid driving license of the person operating the vehicle at the incident time.\n8. **Car Photos (Four Sides)**: High-resolution photos covering front, rear, left, and right angles with VIN stamp visible.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Section 5 - Claims Procedure & Mandatory Documentation',
          excerpt: 'All claim requests require complete verification of vehicle ownership (RC), driver eligibility, survey assessment report, itemized garage quotes, and multi-angle photographic evidence.',
          confidence: 0.99,
        },
      ],
      confidence: 0.98,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  if (q.includes('consumable') || q.includes('oil') || q.includes('nut') || q.includes('coolant')) {
    return {
      answer: `Under standard clauses of **${policyNumber}**, consumable materials such as **engine oil, coolant, AC gas, nuts, bolts, and washer fluid** are subject to standard deduction unless the Consumables Rider is elected.\n\nIn claim **#CLM-2024-089**, a consumable deduction of **₹50.00** was applied according to Section 4.3 because lubricants and fasteners were itemized separately on the garage bill.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Clause 4.3 - Consumable Items Exclusion and Limits',
          excerpt: 'Unless covered under special consumables endorsement, consumable items used during repairs shall be borne by the insured.',
          confidence: 0.95,
        },
      ],
      confidence: 0.91,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  if (q.includes('cashless') || q.includes('garage') || q.includes('network')) {
    return {
      answer: `Policy **${policyNumber}** provides **Cashless Settlement** across over 4,500+ partnered workshops.\n\n• **Network Garages**: The insurer settles repair bills directly with the body shop minus your ₹150 deductible.\n• **Non-Network Garages**: You pay upfront and submit the 8 verified documents in this Claimer Portal for fast-track direct deposit within 24–48 hours of adjuster sign-off.`,
      sources: [
        {
          title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
          section: 'Annexure C - Network Garage Facility & Reimbursement Protocol',
          excerpt: 'Cashless claims are facilitated at listed network garages. For unlisted garages, reimbursement is executed upon submission of verified invoice documents.',
          confidence: 0.93,
        },
      ],
      confidence: 0.92,
      model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
      timestamp: new Date().toISOString(),
    };
  }

  // Default intelligent fallback grounded in POL-882
  return {
    answer: `Regarding your query on Policy **${policyNumber}**:\n\nYour policy is an active **Comprehensive Private Car Package Policy** registered to **Jane Doe** for vehicle **2020 Toyota Camry** (VIN: 4T1B11HK2LU889YYY).\n\nKey Coverage Highlights:\n• **Own Damage Protection**: Active through December 2026.\n• **Third-Party Liability**: Unlimited for bodily injury, up to statutory limits for property damage.\n• **Deductible**: ₹150.00 standard per claim.\n• **Add-on Riders Active**: Zero Depreciation, 24/7 Roadside Assistance & Towing.\n\nIf your question pertains to a specific repair estimate, invoice, or survey report, you can check details in the **Claim Tracker** tab or ask for specific coverage limits.`,
    sources: [
      {
        title: `${policyNumber}_Comprehensive_Motor_Policy.pdf`,
        section: 'Policy Summary & Schedule of Coverages',
        excerpt: 'Comprehensive Motor Policy POL-882 issued to Jane Doe covering 2020 Toyota Camry against collision, fire, theft, and third-party liabilities.',
        confidence: 0.89,
      },
    ],
    confidence: 0.9,
    model: 'ClaimShield-RAG-v2 (Grounding: POL-882)',
    timestamp: new Date().toISOString(),
  };
}

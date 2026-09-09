import { create } from 'zustand';
import { UserRole, ClaimRecord, DocumentItem, UserProfile } from '../types';
import { INITIAL_CLAIMS, INITIAL_UPLOAD_SLOTS, HOTLINKED_ASSETS } from '../data';
import { uploadAndValidateDocument, classifyAutoDocument, submitClaimApi, saveDraftClaimApi, submitClaimClassificationApi, uploadClaimDocumentsToStorageApi, fetchAllClaimsApi } from '../api/claimerApi';

export interface BatchUploadedFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: string;
  fileType: string;
  status: 'uploading' | 'validated' | 'error';
  progress?: number;
  detectedCategory?: 'accident_photos' | 'insurance_policy' | 'repair_invoice' | 'unknown' | string;
  confidence?: number;
  message?: string;
  error?: string;
  uploadedAt: string;
}

export interface UploadSlot {
  id: string;
  title: string;
  subtitle: string;
  required: boolean;
  icon: string;
  categoryPayload: string; // e.g. "car pics", "police report", "driving license", "repair estimate", "third party", "towing receipt"
  status: 'empty' | 'uploading' | 'uploaded' | 'error';
  fileName?: string;
  fileSize?: string;
  progress?: number;
  borderTheme: 'error' | 'warning' | 'success' | 'default';
  hint: string;
  error?: string;
  successMessage?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export const DEFAULT_CLAIMER_USER: UserProfile = {
  id: 'usr-claimer-1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  role: 'claimer',
  roleTitle: 'Motor Policyholder',
  avatar: HOTLINKED_ASSETS.claimerAvatar,
  policyNumber: 'POL-882',
};

export const DEFAULT_VALIDATOR_USER: UserProfile = {
  id: 'usr-validator-1',
  name: 'Alex Vance',
  email: 'alex.vance@claimshield.internal',
  role: 'validator',
  roleTitle: 'Senior Motor Adjuster',
  department: 'Claims Division 01',
  avatar: HOTLINKED_ASSETS.validatorAvatar,
};

interface ClaimStoreState {
  // Auth & Session
  isAuthenticated: boolean;
  currentUser: UserProfile | null;

  // Navigation & Role
  role: UserRole;
  activeNav: string;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  searchQuery: string;

  // Claims
  claims: ClaimRecord[];
  isLoadingClaims: boolean;
  claimsError: string | null;
  selectedClaimForReviewId: string;
  selectedClaimForReportId: string | null;
  fetchClaims: () => Promise<void>;

  // Upload slots for Claimer (Legacy single-slot)
  uploadSlots: UploadSlot[];
  showErrorToast: boolean;
  isSubmittingClaim: boolean;
  submitMessage: string | null;
  submitError: string | null;

  // Multi-Document Upload for Claimer
  batchFiles: BatchUploadedFile[];
  carFiles: BatchUploadedFile[];
  pdfFiles: BatchUploadedFile[];
  uploadBatchFiles: (files: FileList | File[]) => Promise<void>;
  uploadCarFiles: (files: FileList | File[]) => Promise<void>;
  uploadPdfFiles: (files: FileList | File[]) => Promise<void>;
  removeBatchFile: (fileId: string) => void;
  removeCarFile: (fileId: string) => void;
  removePdfFile: (fileId: string) => void;
  clearBatchFiles: () => void;
  clearAllUploads: () => void;

  // Modals & Drawers
  isSplitVerificationOpen: boolean;
  isDownloadModalOpen: boolean;
  isNotificationsOpen: boolean;
  isResolutionDrawerOpen: boolean;
  selectedTrackingClaimId: string;

  // Notifications
  notifications: NotificationItem[];

  // Auth actions
  login: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Navigation actions
  setRole: (role: UserRole) => void;
  setActiveNav: (nav: string) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setSearchQuery: (query: string) => void;

  setSelectedClaimForReviewId: (id: string) => void;
  setSelectedClaimForReportId: (id: string | null) => void;
  setSelectedTrackingClaimId: (id: string) => void;

  setSplitVerificationOpen: (open: boolean) => void;
  setDownloadModalOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setResolutionDrawerOpen: (open: boolean) => void;

  setShowErrorToast: (show: boolean) => void;
  setSubmitMessage: (msg: string | null) => void;
  setSubmitError: (msg: string | null) => void;

  // Claim management actions
  updateClaimStatus: (claimId: string, newStatus: 'approved' | 'rejected' | 'pending') => void;
  approveClaim: (claimId: string, deductions: number, notes: string) => void;
  rejectClaim: (claimId: string, notes: string) => void;
  runAiVerification: (claimId: string) => void;

  // File Upload actions
  uploadFileToSlot: (slotId: string, file: File) => Promise<void>;
  removeFileFromSlot: (slotId: string) => void;
  completeSlotUpload: (slotId: string) => void;
  saveDraftClaim: () => void;
  submitClaim: (onComplete?: () => void) => Promise<void>;

  // Notification actions
  markAllNotificationsRead: () => void;
}

export const useClaimStore = create<ClaimStoreState>((set, get) => ({
  // Initial state - authenticated with default claimer so demo immediately loads, but user can log out to access login screen anytime
  isAuthenticated: true,
  currentUser: DEFAULT_CLAIMER_USER,
  role: 'claimer',
  activeNav: 'upload',
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  searchQuery: '',

  claims: [],
  isLoadingClaims: false,
  claimsError: null,
  selectedClaimForReviewId: '',
  selectedClaimForReportId: null,
  selectedTrackingClaimId: '',

  uploadSlots: INITIAL_UPLOAD_SLOTS as UploadSlot[],
  batchFiles: [],
  carFiles: [],
  pdfFiles: [],
  showErrorToast: false,
  isSubmittingClaim: false,
  submitMessage: null,
  submitError: null,

  isSplitVerificationOpen: false,
  isDownloadModalOpen: false,
  isNotificationsOpen: false,
  isResolutionDrawerOpen: false,

  notifications: [],

  // Auth actions
  login: (role: UserRole, customUser) => {
    const user =
      role === 'claimer'
        ? { ...DEFAULT_CLAIMER_USER, ...customUser }
        : { ...DEFAULT_VALIDATOR_USER, ...customUser };
    set({
      isAuthenticated: true,
      currentUser: user,
      role,
      activeNav: role === 'claimer' ? 'upload' : 'queue',
      isMobileSidebarOpen: false,
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      isMobileSidebarOpen: false,
    });
  },

  switchRole: (newRole: UserRole) => {
    const user = newRole === 'claimer' ? DEFAULT_CLAIMER_USER : DEFAULT_VALIDATOR_USER;
    set({
      role: newRole,
      currentUser: user,
      activeNav: newRole === 'claimer' ? 'upload' : 'queue',
      isMobileSidebarOpen: false,
    });
  },

  // Actions
  setRole: (role: UserRole) => {
    const user = role === 'claimer' ? DEFAULT_CLAIMER_USER : DEFAULT_VALIDATOR_USER;
    set({
      role,
      currentUser: user,
      activeNav: role === 'claimer' ? 'upload' : 'queue',
      isMobileSidebarOpen: false,
    });
  },

  setActiveNav: (activeNav: string) => {
    set({ activeNav, isMobileSidebarOpen: false });
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  setSidebarCollapsed: (isSidebarCollapsed: boolean) => {
    set({ isSidebarCollapsed });
  },

  setIsMobileSidebarOpen: (open) => {
    set((state) => ({
      isMobileSidebarOpen: typeof open === 'function' ? open(state.isMobileSidebarOpen) : open,
    }));
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setSelectedClaimForReviewId: (id: string) => set({ selectedClaimForReviewId: id }),
  setSelectedClaimForReportId: (id: string | null) => set({ selectedClaimForReportId: id }),
  setSelectedTrackingClaimId: (id: string) => set({ selectedTrackingClaimId: id }),

  setSplitVerificationOpen: (isSplitVerificationOpen: boolean) =>
    set({ isSplitVerificationOpen }),
  setDownloadModalOpen: (isDownloadModalOpen: boolean) => set({ isDownloadModalOpen }),
  setNotificationsOpen: (isNotificationsOpen: boolean) => set({ isNotificationsOpen }),
  setResolutionDrawerOpen: (isResolutionDrawerOpen: boolean) => set({ isResolutionDrawerOpen }),

  setShowErrorToast: (showErrorToast: boolean) => set({ showErrorToast }),
  setSubmitMessage: (submitMessage: string | null) => set({ submitMessage }),
  setSubmitError: (submitError: string | null) => set({ submitError }),

  updateClaimStatus: (claimId, newStatus) => {
    set((state) => ({
      claims: state.claims.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: newStatus === 'approved' ? 'succeeded' : newStatus,
            statusLabel:
              newStatus === 'approved'
                ? 'Succeeded'
                : newStatus === 'rejected'
                ? 'Rejected'
                : 'Pending',
          };
        }
        return c;
      }),
    }));
  },

  approveClaim: (claimId, deductions, notes) => {
    set((state) => ({
      claims: state.claims.map((c) => {
        if (c.id === claimId) {
          const approved = Math.max(0, c.repairEstimate - deductions);
          return {
            ...c,
            status: 'succeeded',
            statusLabel: 'Succeeded',
            deductible: deductions,
            financialBreakdown: {
              ...c.financialBreakdown,
              deductible: deductions,
              approvedAmount: approved,
            },
            validatorRemarks: notes,
          };
        }
        return c;
      }),
    }));
  },

  rejectClaim: (claimId, notes) => {
    set((state) => ({
      claims: state.claims.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: 'rejected',
            statusLabel: 'Rejected',
            validatorRemarks: notes,
          };
        }
        return c;
      }),
    }));
  },

  runAiVerification: (claimId) => {
    set((state) => ({
      claims: state.claims.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            aiSummary: {
              ...c.aiSummary,
              damageVerified: true,
              policyActive: true,
              fraudScore: Math.min(c.aiSummary.fraudScore, 7),
              fraudLabel: `Low Risk (${Math.min(c.aiSummary.fraudScore, 7)}/100)`,
              damageAssessment: c.aiSummary.damageAssessment.includes('(AI Verified)')
                ? c.aiSummary.damageAssessment
                : `${c.aiSummary.damageAssessment} (AI Verified)`,
            },
            documents: c.documents.map((d) => ({
              ...d,
              status: 'verified_agent',
              error: undefined,
            })),
          };
        }
        return c;
      }),
    }));
  },

  uploadFileToSlot: async (slotId, file) => {
    const targetSlot = get().uploadSlots.find((s) => s.id === slotId);
    if (!targetSlot) return;

    // 1. Enter uploading state
    set((state) => ({
      uploadSlots: state.uploadSlots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              status: 'uploading' as const,
              fileName: file.name,
              fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              progress: 35,
              error: undefined,
              successMessage: undefined,
              borderTheme: 'default' as const,
            }
          : slot
      ),
    }));

    // Simulated progress tick
    setTimeout(() => {
      set((state) => ({
        uploadSlots: state.uploadSlots.map((slot) =>
          slot.id === slotId && slot.status === 'uploading'
            ? { ...slot, progress: 80 }
            : slot
        ),
      }));
    }, 350);

    // 2. Call Single Unified API with category property ('car pics', 'police report', etc.)
    const response = await uploadAndValidateDocument({
      claimId: '#CLM-9821',
      category: targetSlot.categoryPayload || 'car pics',
      file,
      metadata: { slotId },
    });

    // 3. Process backend response within card
    if (response.success) {
      set((state) => ({
        uploadSlots: state.uploadSlots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                status: 'uploaded' as const,
                progress: 100,
                borderTheme: 'success' as const,
                successMessage: response.message,
                error: undefined,
              }
            : slot
        ),
      }));
    } else {
      set((state) => ({
        uploadSlots: state.uploadSlots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                status: 'error' as const,
                progress: undefined,
                borderTheme: 'error' as const,
                error: response.error || response.message,
                successMessage: undefined,
              }
            : slot
        ),
      }));
    }
  },

  removeFileFromSlot: (slotId) => {
    set((state) => ({
      uploadSlots: state.uploadSlots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            status: 'empty' as const,
            fileName: undefined,
            fileSize: undefined,
            progress: undefined,
            error: undefined,
            successMessage: undefined,
            borderTheme: slot.required ? ('warning' as const) : ('success' as const),
          };
        }
        return slot;
      }),
    }));
  },

  completeSlotUpload: (slotId) => {
    set((state) => ({
      uploadSlots: state.uploadSlots.map((s) =>
        s.id === slotId
          ? {
              ...s,
              status: 'uploaded' as const,
              progress: 100,
              borderTheme: 'success' as const,
              error: undefined,
              successMessage: '✓ Document validated and ready for submission.',
            }
          : s
      ),
    }));
  },

  uploadBatchFiles: async (filesInput) => {
    const files = Array.from(filesInput);
    if (files.length === 0) return;

    // 1. Generate items with immediate format validation
    const newItems: BatchUploadedFile[] = files.map((file) => {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      const isFormatAllowed = isImage || isPdf;

      return {
        id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        status: isFormatAllowed ? ('uploading' as const) : ('error' as const),
        progress: isFormatAllowed ? 30 : undefined,
        error: isFormatAllowed
          ? undefined
          : 'Invalid file format. Only JPEG, JPG, PNG images and PDF documents are allowed.',
        uploadedAt: new Date().toISOString(),
      };
    });

    set((state) => ({
      batchFiles: [...state.batchFiles, ...newItems],
    }));

    // 2. Concurrently classify supported files via Classification API
    await Promise.all(
      newItems.map(async (item) => {
        if (item.status === 'error') return;

        // Simulated progress increment
        setTimeout(() => {
          set((state) => ({
            batchFiles: state.batchFiles.map((f) =>
              f.id === item.id && f.status === 'uploading' ? { ...f, progress: 75 } : f
            ),
          }));
        }, 300);

        try {
          const res = await classifyAutoDocument(item.file);

          set((state) => ({
            batchFiles: state.batchFiles.map((f) => {
              if (f.id !== item.id) return f;
              if (res.success) {
                return {
                  ...f,
                  status: 'validated' as const,
                  progress: 100,
                  detectedCategory: res.category,
                  confidence: res.classificationResult?.confidence ?? 0.95,
                  message: res.message,
                  error: undefined,
                };
              } else {
                return {
                  ...f,
                  status: 'error' as const,
                  progress: undefined,
                  detectedCategory: res.category,
                  error: res.error || res.message || 'Validation failed for this document.',
                };
              }
            }),
          }));
        } catch (err: any) {
          set((state) => ({
            batchFiles: state.batchFiles.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'error' as const,
                    progress: undefined,
                    error: err.message || 'Classification request failed.',
                  }
                : f
            ),
          }));
        }
      })
    );
  },

  removeBatchFile: (fileId) => {
    set((state) => ({
      batchFiles: state.batchFiles.filter((f) => f.id !== fileId),
    }));
  },

  uploadCarFiles: async (filesInput) => {
    const files = Array.from(filesInput);
    if (files.length === 0) return;

    const newItems: BatchUploadedFile[] = files.map((file) => {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);
      return {
        id: `car-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileType: file.type || 'image/jpeg',
        status: isImage ? ('validated' as const) : ('error' as const),
        detectedCategory: 'vehiclepicture',
        error: isImage
          ? undefined
          : 'Invalid format. Car photos must be JPEG, JPG, or PNG images only.',
        uploadedAt: new Date().toISOString(),
      };
    });

    set((state) => ({
      carFiles: [...state.carFiles, ...newItems],
    }));
  },

  uploadPdfFiles: async (filesInput) => {
    const files = Array.from(filesInput);
    if (files.length === 0) return;

    const newItems: BatchUploadedFile[] = files.map((file) => {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      return {
        id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileType: 'application/pdf',
        status: isPdf ? ('validated' as const) : ('error' as const),
        detectedCategory: 'Additional_documents',
        error: isPdf
          ? undefined
          : 'Invalid format. Insurance policy and repair invoice must be PDF files only.',
        uploadedAt: new Date().toISOString(),
      };
    });

    set((state) => ({
      pdfFiles: [...state.pdfFiles, ...newItems],
    }));
  },

  removeCarFile: (fileId) => {
    set((state) => ({
      carFiles: state.carFiles.filter((f) => f.id !== fileId),
    }));
  },

  removePdfFile: (fileId) => {
    set((state) => ({
      pdfFiles: state.pdfFiles.filter((f) => f.id !== fileId),
    }));
  },

  clearBatchFiles: () => {
    set({ batchFiles: [] });
  },

  clearAllUploads: () => {
    set({ carFiles: [], pdfFiles: [], batchFiles: [] });
  },

  saveDraftClaim: async () => {
    const response = await saveDraftClaimApi({
      id: '#CLM-9821',
      claimerName: 'Jane Doe',
    });
    set({ submitMessage: response.message });
    setTimeout(() => {
      set({ submitMessage: null });
    }, 4000);
  },

  submitClaim: async (onComplete) => {
    set({ isSubmittingClaim: true, submitError: null, submitMessage: null });

    // 1. Extract File objects for car photos and supporting PDFs
    const carFileList = get().carFiles.filter((f) => f.status === 'validated').map((f) => f.file);
    const pdfFileList = get().pdfFiles.filter((f) => f.status === 'validated').map((f) => f.file);

    // 2. Call backend storage upload endpoint: POST http://127.0.0.1:8000/api/v1/claims/upload-to-storage
    // Appends car photos and supporting PDFs under repeated key 'files', plus description & claim_status
    console.log('[submitClaim] Uploading documents to storage: http://127.0.0.1:8000/api/v1/claims/upload-to-storage ...');
    const storageResult = await uploadClaimDocumentsToStorageApi(carFileList, pdfFileList, {
      description: 'Four-wheeler accident claim with 4-side photos and policy docs',
      claim_status: 'PENDING_VERIFICATION',
    });

    if (!storageResult.success) {
      console.error('[submitClaim] Storage upload failure:', storageResult.error);
      set({
        isSubmittingClaim: false,
        submitError:
          storageResult.error ||
          'Failed to upload documents to storage service (http://127.0.0.1:8000/api/v1/claims/upload-to-storage). Please check backend connection and retry.',
      });
      return;
    }

    console.log('[submitClaim] Storage upload succeeded:', storageResult.data);

    // 3. Optional: Call classification endpoint for additional verification if needed
    try {
      await submitClaimClassificationApi(carFileList, pdfFileList);
    } catch (apiErr) {
      console.warn('[submitClaim] Optional classification call caught error:', apiErr);
    }

    // 4. Collect validated documents for claim record creation
    const carList = get().carFiles.filter((f) => f.status === 'validated');
    const pdfList = get().pdfFiles.filter((f) => f.status === 'validated');
    const batchList = get().batchFiles.filter((f) => f.status === 'validated');
    const uploadedSlots = get().uploadSlots.filter((s) => s.status === 'uploaded');

    const combinedList = [...carList, ...pdfList, ...batchList];

    const documentsToSubmit =
      combinedList.length > 0
        ? combinedList.map((f) => ({
            category: f.detectedCategory || (f.fileType.startsWith('image') ? 'vehiclepicture' : 'Additional_documents'),
            fileName: f.fileName,
            size: f.fileSize,
          }))
        : uploadedSlots.map((s) => ({
            category: s.categoryPayload,
            fileName: s.fileName || s.title,
            size: s.fileSize || '2.0 MB',
          }));

    const createdClaimId =
      storageResult.data?.claim_id ||
      storageResult.data?.claimId ||
      `CLM-${Date.now().toString(36).toUpperCase()}`;

    const currentUser = get().currentUser;
    const response = await submitClaimApi({
      claimId: createdClaimId,
      claimerName: currentUser?.name || 'Policyholder',
      carPolicy: currentUser?.policyNumber || '',
      vehicle: '',
      incidentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      incidentLocation: '',
      repairEstimate: 0,
      documents: documentsToSubmit,
    });

    if (response.success) {
      const successMessage =
        storageResult.data?.message ||
        `Claim ${response.claim.id} documents uploaded to storage successfully! Redirecting to tracking...`;

      // Clear uploads
      get().clearAllUploads();

      set((state) => ({
        claims: [response.claim, ...state.claims.filter((c) => c.id !== response.claim.id)],
        selectedTrackingClaimId: response.claim.id,
        isSubmittingClaim: false,
        submitMessage: successMessage,
      }));

      // Refresh claims from PostgreSQL backend storage
      get().fetchClaims();

      setTimeout(() => {
        set({ submitMessage: null, activeNav: 'history' });
        if (onComplete) onComplete();
      }, 1500);
    } else {
      set({
        isSubmittingClaim: false,
        submitError: response.message || 'Failed to complete claim submission.',
      });
    }
  },

  fetchClaims: async () => {
    set({ isLoadingClaims: true, claimsError: null });
    const res = await fetchAllClaimsApi();
    if (res.success) {
      set((state) => ({
        claims: res.claims,
        isLoadingClaims: false,
        claimsError: null,
        selectedTrackingClaimId: state.selectedTrackingClaimId || res.claims[0]?.id || '',
        selectedClaimForReviewId: state.selectedClaimForReviewId || res.claims[0]?.id || '',
      }));
    } else {
      set({
        isLoadingClaims: false,
        claimsError: res.error || 'Failed to fetch claims from server',
      });
    }
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));


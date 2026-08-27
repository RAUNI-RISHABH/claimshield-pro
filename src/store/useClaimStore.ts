import { create } from 'zustand';
import { UserRole, ClaimRecord, DocumentItem, UserProfile } from '../types';
import { INITIAL_CLAIMS, INITIAL_UPLOAD_SLOTS, HOTLINKED_ASSETS } from '../data';
import { uploadAndValidateDocument, submitClaimApi, saveDraftClaimApi } from '../api/claimerApi';

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
  selectedClaimForReviewId: string;
  selectedClaimForReportId: string | null;

  // Upload slots for Claimer
  uploadSlots: UploadSlot[];
  showErrorToast: boolean;
  isSubmittingClaim: boolean;
  submitMessage: string | null;

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

  claims: INITIAL_CLAIMS,
  selectedClaimForReviewId: INITIAL_CLAIMS[0].id,
  selectedClaimForReportId: null,
  selectedTrackingClaimId: '#CLM-2024-089',

  uploadSlots: INITIAL_UPLOAD_SLOTS as UploadSlot[],
  showErrorToast: false,
  isSubmittingClaim: false,
  submitMessage: null,

  isSplitVerificationOpen: false,
  isDownloadModalOpen: false,
  isNotificationsOpen: false,
  isResolutionDrawerOpen: false,

  notifications: [
    {
      id: 'n1',
      title: 'Claim #CLM-2024-089 Approved',
      desc: 'Your auto collision reimbursement claim for $1,050.00 has been approved.',
      time: '10 minutes ago',
      read: false,
      type: 'success',
    },
    {
      id: 'n2',
      title: 'Action Required: Re-upload Car Photos',
      desc: 'Car photo for Claim #CLM-9821 was flagged by AI reviewer as too dark. Please provide a clear copy.',
      time: '1 hour ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'n3',
      title: 'Policy Renewal Confirmation',
      desc: 'Your policy POL-882 is active through December 2026.',
      time: '2 days ago',
      read: true,
      type: 'info',
    },
  ],

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
    set({ isSubmittingClaim: true });

    const uploadedSlots = get().uploadSlots.filter((s) => s.status === 'uploaded');
    const response = await submitClaimApi({
      claimId: '#CLM-9821',
      claimerName: 'Jane Doe',
      carPolicy: 'POL-882',
      vehicle: '2020 Toyota Camry',
      incidentDate: 'Oct 24, 2024, 11:30 AM',
      incidentLocation: 'Pine & 6th Ave, Seattle, WA',
      repairEstimate: 1450.0,
      documents: uploadedSlots.map((s) => ({
        category: s.categoryPayload,
        fileName: s.fileName || s.title,
        size: s.fileSize || '2.0 MB',
      })),
    });

    if (response.success) {
      set((state) => ({
        claims: [response.claim, ...state.claims],
        selectedTrackingClaimId: response.claim.id,
        isSubmittingClaim: false,
        submitMessage: `Claim ${response.claim.id} submitted successfully! Redirecting to tracking...`,
      }));

      setTimeout(() => {
        set({ submitMessage: null, activeNav: 'history' });
        if (onComplete) onComplete();
      }, 1200);
    }
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));


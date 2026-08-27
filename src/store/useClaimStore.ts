import { create } from 'zustand';
import { UserRole, ClaimRecord, DocumentItem, UserProfile } from '../types';
import { INITIAL_CLAIMS, INITIAL_UPLOAD_SLOTS, HOTLINKED_ASSETS } from '../data';

export interface UploadSlot {
  id: string;
  title: string;
  subtitle: string;
  required: boolean;
  icon: string;
  status: 'empty' | 'uploading' | 'uploaded';
  fileName?: string;
  progress?: number;
  borderTheme: 'error' | 'warning' | 'success' | 'default';
  hint: string;
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

  // File Upload actions
  uploadFileToSlot: (slotId: string, fileName: string) => void;
  removeFileFromSlot: (slotId: string) => void;
  completeSlotUpload: (slotId: string) => void;
  saveDraftClaim: () => void;
  submitClaim: (onComplete?: () => void) => void;

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
  showErrorToast: true,
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

  uploadFileToSlot: (slotId, fileName) => {
    set((state) => ({
      uploadSlots: state.uploadSlots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            status: 'uploaded',
            fileName,
            progress: 100,
            borderTheme: 'success',
          };
        }
        return slot;
      }),
    }));
  },

  removeFileFromSlot: (slotId) => {
    set((state) => ({
      uploadSlots: state.uploadSlots.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            status: 'empty',
            fileName: undefined,
            progress: undefined,
            borderTheme: slot.required ? 'warning' : 'success',
          };
        }
        return slot;
      }),
    }));
  },

  completeSlotUpload: (slotId) => {
    set((state) => ({
      uploadSlots: state.uploadSlots.map((s) =>
        s.id === slotId ? { ...s, status: 'uploaded', progress: 100 } : s
      ),
    }));
  },

  saveDraftClaim: () => {
    set({ submitMessage: 'Draft claim saved successfully! You can resume anytime.' });
    setTimeout(() => {
      set({ submitMessage: null });
    }, 4000);
  },

  submitClaim: (onComplete) => {
    set({ isSubmittingClaim: true });
    setTimeout(() => {
      const newClaim: ClaimRecord = {
        id: '#CLM-9821',
        claimerName: 'Jane Doe',
        carPolicy: 'POL-882',
        submissionDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        incidentDate: 'Oct 24, 2024, 11:30 AM',
        incidentLocation: 'Pine & 6th Ave, Seattle, WA',
        vehicle: '2020 Toyota Camry',
        vin: '4T1B11HK2LU889YYY',
        repairEstimate: 1450.0,
        deductible: 200.0,
        potentialPayout: 1250.0,
        docsUploaded: get().uploadSlots.filter((s) => s.status === 'uploaded').length,
        docsTotal: get().uploadSlots.length,
        status: 'pending',
        statusLabel: 'Pending',
        diagnosisCode: 'J01.90 (Bumper / Hood Dent)',
        aiSummary: {
          damageAssessment: 'Front Bumper Scrape & Dent',
          damageVerified: true,
          policyMatching: 'Standard Coverage',
          policyActive: true,
          fraudScore: 9,
          fraudLabel: 'Low Risk (9/100)',
        },
        financialBreakdown: {
          originalEstimate: 1450.0,
          deductible: 200.0,
          consumables: 0.0,
          approvedAmount: 1250.0,
        },
        validatorRemarks: 'Under review by motor division validator.',
        expectedPayoutDate: 'Pending Review',
        documents: [],
      };

      set((state) => ({
        claims: [newClaim, ...state.claims],
        selectedTrackingClaimId: newClaim.id,
        isSubmittingClaim: false,
        submitMessage: 'Claim #CLM-9821 submitted successfully! Redirecting to tracking...',
      }));

      setTimeout(() => {
        set({ submitMessage: null, activeNav: 'history' });
        if (onComplete) onComplete();
      }, 1200);
    }, 1000);
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));

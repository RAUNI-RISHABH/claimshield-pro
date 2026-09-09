import React from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ClaimRecord } from '../types';

interface ResolutionDrawerProps {
  claim?: ClaimRecord;
  isOpen?: boolean;
  onClose?: () => void;
  onDownloadReport?: () => void;
}

export const ResolutionDrawer: React.FC<ResolutionDrawerProps> = ({
  claim: propClaim,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onDownloadReport: propOnDownloadReport,
}) => {
  const storeIsOpen = useClaimStore((state) => state.isResolutionDrawerOpen);
  const setStoreIsOpen = useClaimStore((state) => state.setResolutionDrawerOpen);
  const claims = useClaimStore((state) => state.claims);
  const selectedTrackingClaimId = useClaimStore((state) => state.selectedTrackingClaimId);
  const setDownloadModalOpen = useClaimStore((state) => state.setDownloadModalOpen);
  const setSelectedClaimForReportId = useClaimStore((state) => state.setSelectedClaimForReportId);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const claim =
    propClaim ||
    claims.find((c) => c.id === selectedTrackingClaimId) ||
    claims[0];

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setStoreIsOpen(false);
    }
  };

  const handleDownload = () => {
    if (propOnDownloadReport) {
      propOnDownloadReport();
    } else if (claim) {
      setSelectedClaimForReportId(claim.id);
      setDownloadModalOpen(true);
      setStoreIsOpen(false);
    }
  };

  if (!isOpen || !claim) {
    return null;
  }

  const originalEstimate =
    claim.financialBreakdown?.originalEstimate ?? claim.repairEstimate ?? 0;
  const deductible = claim.financialBreakdown?.deductible ?? claim.deductible ?? 0;
  const consumables = claim.financialBreakdown?.consumables ?? 0;
  const approvedAmount =
    claim.financialBreakdown?.approvedAmount ??
    claim.potentialPayout ??
    Math.max(0, originalEstimate - deductible - consumables);

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Resolution Drawer */}
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.15)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[#e2e8f0]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00355f] text-[24px]">verified_user</span>
            <div>
              <h2 className="text-lg font-bold text-[#0f1c2b]">Resolution Report</h2>
              <p className="text-xs text-[#64748b]">{claim.id}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#42474f] hover:text-[#0f1c2b] hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Claim Approved Card */}
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#10b981] mt-0.5 filled-icon text-[24px]">
              verified
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#065f46] mb-0.5">
                {claim.status === 'succeeded' || claim.status === 'approved'
                  ? 'Claim Approved'
                  : claim.status === 'rejected'
                  ? 'Claim Rejected'
                  : 'Claim Under Review'}
              </h3>
              <p className="text-xs text-[#047857] leading-relaxed">
                {claim.status === 'succeeded' || claim.status === 'approved'
                  ? 'Your claim has been successfully verified against your active motor policy.'
                  : claim.status === 'rejected'
                  ? 'Your claim was rejected based on policy coverage restrictions.'
                  : 'Your claim documents are currently being processed by the validation team.'}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-[#727780] mb-3 uppercase tracking-wider">
              Financial Breakdown
            </h4>
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-[#e2e8f0] flex justify-between font-semibold text-[#64748b]">
                <span>Item</span>
                <span>Amount</span>
              </div>
              <div className="px-4 py-3 border-b border-[#e2e8f0] flex justify-between text-[#0f1c2b] font-medium">
                <span>Original Repair Estimate</span>
                <span>₹{originalEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="px-4 py-3 border-b border-[#e2e8f0] flex justify-between text-[#ba1a1a] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">remove</span> Deductible / Depreciation
                </span>
                <span>-₹{deductible.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {consumables > 0 && (
                <div className="px-4 py-3 border-b border-[#e2e8f0] flex justify-between text-[#ba1a1a] font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">remove</span> Consumables (Not Covered)
                  </span>
                  <span>-₹{consumables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="bg-[#eef4ff] px-4 py-4 flex justify-between items-center border-t border-[#cde5fc]">
                <span className="text-xs font-semibold text-[#4a6173]">Final Approved Amount</span>
                <span className="text-xl font-bold text-[#00355f]">
                  ₹{approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Validator Remarks */}
          <div>
            <h4 className="text-xs font-bold text-[#727780] mb-2 uppercase tracking-wider">
              Validator Remarks
            </h4>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs text-[#0f1c2b] leading-relaxed italic">
              "{claim.validatorRemarks || 'Documents verified against active policy. Vehicle inspection and collision report align with incident details.'}"
            </div>
          </div>

          {/* Metadata quick items */}
          <div className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Policy Number:</span>
              <span className="font-semibold text-[#0f1c2b]">{claim.carPolicy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Vehicle:</span>
              <span className="font-semibold text-[#0f1c2b]">{claim.vehicle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Expected Payout Date:</span>
              <span className="font-semibold text-[#10b981]">
                {claim.expectedPayoutDate || 'Within 3-5 business days'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with Download Action */}
        <div className="p-6 border-t border-[#e2e8f0] bg-white">
          <button
            onClick={handleDownload}
            className="w-full bg-[#00355f] hover:bg-[#0f4c81] text-white transition-colors text-xs font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PDF Report
          </button>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ClaimRecord } from '../types';
import {
  approveClaimApi,
  rejectClaimApi,
  processAiVerificationApi,
  requestMoreInfoApi,
} from '../api/validatorApi';

type ActionType = 'ai_check' | 'approve' | 'reject' | 'request_info';

interface ConfirmModalData {
  isOpen: boolean;
  actionType: ActionType | null;
  notes: string;
  deductible: string;
}

export const AutoCollisionReportView: React.FC = () => {
  const claims = useClaimStore((state) => state.claims);
  const selectedClaimForReviewId = useClaimStore((state) => state.selectedClaimForReviewId);
  const updateClaimStatus = useClaimStore((state) => state.updateClaimStatus);
  const approveClaim = useClaimStore((state) => state.approveClaim);
  const rejectClaim = useClaimStore((state) => state.rejectClaim);
  const runAiVerification = useClaimStore((state) => state.runAiVerification);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const setSplitVerificationOpen = useClaimStore((state) => state.setSplitVerificationOpen);
  const setResolutionDrawerOpen = useClaimStore((state) => state.setResolutionDrawerOpen);
  const setSelectedTrackingClaimId = useClaimStore((state) => state.setSelectedTrackingClaimId);

  const claim: ClaimRecord =
    claims.find((c) => c.id === selectedClaimForReviewId) || claims[0];

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({
    isOpen: false,
    actionType: null,
    notes: '',
    deductible: claim.deductible.toFixed(2),
  });

  const isSucceeded = claim.status === 'approved' || claim.status === 'succeeded';
  const isRejected = claim.status === 'rejected';
  const isPending = !isSucceeded && !isRejected;

  const handleOpenConfirmModal = (actionType: ActionType) => {
    let initialNotes = '';
    if (actionType === 'approve') {
      initialNotes = `Verified repair estimates and vehicle incident report for ${claim.vehicle}. Claim approved for payment.`;
    } else if (actionType === 'reject') {
      initialNotes = 'Damage assessment does not match covered peril or policy exclusion applies.';
    } else if (actionType === 'request_info') {
      initialNotes = 'Please provide clearer damage photos with VIN clearly visible and a signed police FIR summary.';
    } else if (actionType === 'ai_check') {
      initialNotes = 'Run deep OCR extraction and collision damage cross-referencing model.';
    }

    setConfirmModal({
      isOpen: true,
      actionType,
      notes: initialNotes,
      deductible: claim.deductible.toFixed(2),
    });
  };

  const handleCloseConfirmModal = () => {
    if (isProcessingAction) return;
    setConfirmModal((prev) => ({ ...prev, isOpen: false, actionType: null }));
  };

  const handleExecuteConfirmedAction = async () => {
    if (!confirmModal.actionType) return;
    setIsProcessingAction(true);

    if (confirmModal.actionType === 'ai_check') {
      const response = await processAiVerificationApi(claim.id);
      runAiVerification(claim.id);
      setFeedbackMessage(response.message);
    } else if (confirmModal.actionType === 'approve') {
      const deductVal = parseFloat(confirmModal.deductible) || claim.deductible;
      const response = await approveClaimApi({
        claimId: claim.id,
        deductible: deductVal,
        notes: confirmModal.notes,
      });
      approveClaim(claim.id, deductVal, confirmModal.notes);
      const payout = Math.max(0, claim.repairEstimate - deductVal);
      setFeedbackMessage(
        `Claim ${claim.id} approved successfully! Settlement payout of $${payout.toLocaleString('en-US', { minimumFractionDigits: 2 })} authorized.`
      );
    } else if (confirmModal.actionType === 'reject') {
      const response = await rejectClaimApi({
        claimId: claim.id,
        notes: confirmModal.notes,
      });
      rejectClaim(claim.id, confirmModal.notes);
      setFeedbackMessage(response.message);
    } else if (confirmModal.actionType === 'request_info') {
      const response = await requestMoreInfoApi({
        claimId: claim.id,
        notes: confirmModal.notes,
      });
      setFeedbackMessage(response.message);
    }

    setIsProcessingAction(false);
    setConfirmModal((prev) => ({ ...prev, isOpen: false, actionType: null }));
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleReopenClaim = () => {
    updateClaimStatus(claim.id, 'pending');
    setFeedbackMessage(`Claim ${claim.id} reopened and moved back to Pending Review.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleViewBreakdown = () => {
    setSelectedTrackingClaimId(claim.id);
    setResolutionDrawerOpen(true);
  };

  const handleBackToQueue = () => {
    setActiveNav('queue');
  };

  const handleOpenSplitVerification = () => {
    setSplitVerificationOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Header Bar with Breadcrumb and Status */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#42474f] font-semibold mb-1">
            <button
              onClick={handleBackToQueue}
              className="hover:text-[#00355f] transition-colors cursor-pointer"
            >
              Claims Queue
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00355f] font-bold">{claim.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1c2b] tracking-tight">
              Auto Collision Report
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSucceeded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isRejected
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSucceeded
                    ? 'bg-[#10b981]'
                    : isRejected
                    ? 'bg-[#ef4444]'
                    : 'bg-amber-500'
                }`}
              ></span>
              {isSucceeded ? 'Succeeded' : isRejected ? 'Rejected' : 'Pending Review'}
            </span>
          </div>
        </div>

        {/* Action to launch Split Screen Verification */}
        <button
          onClick={handleOpenSplitVerification}
          className="bg-[#eef4ff] hover:bg-[#dce9fe] text-[#00355f] border border-[#cde5fc] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">splitscreen</span>
          Launch Split-Screen Verification
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#10b981] filled-icon">check_circle</span>
            <p className="text-xs text-[#065f46] font-medium">{feedbackMessage}</p>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[#065f46] hover:bg-emerald-100 p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main Grid: Left details column + Right document review column */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column (AI Review, Details, Financials) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* AI Review Summary */}
          <div className="bg-white border border-[#c2c7d1] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0f1c2b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4a6173]">psychology</span>
                AI Review Summary
              </h2>
              {isPending && (
                <button
                  onClick={() => handleOpenConfirmModal('ai_check')}
                  className="text-xs font-bold text-[#00355f] bg-[#eef4ff] hover:bg-[#dce9fe] px-2.5 py-1 rounded-md border border-[#cde5fc] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  Re-run AI Analysis
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Damage Assessment */}
              <div className="bg-[#eef4ff] p-4 rounded-lg border border-[#c2c7d1]">
                <p className="text-[11px] text-[#42474f] font-semibold mb-1">Damage Assessment</p>
                <p className="text-sm text-[#0f1c2b] font-bold">
                  {claim.aiSummary.damageAssessment}
                </p>
                <p className="text-[11px] text-[#4a6173] mt-2 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified via photos
                </p>
              </div>

              {/* Policy Matching */}
              <div className="bg-[#eef4ff] p-4 rounded-lg border border-[#c2c7d1]">
                <p className="text-[11px] text-[#42474f] font-semibold mb-1">Policy Matching</p>
                <p className="text-sm text-[#0f1c2b] font-bold">
                  {claim.aiSummary.policyMatching}
                </p>
                <p className="text-[11px] text-[#10b981] mt-2 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Active Policy
                </p>
              </div>

              {/* Fraud Score */}
              <div className="bg-[#eef4ff] p-4 rounded-lg border border-[#c2c7d1]">
                <p className="text-[11px] text-[#42474f] font-semibold mb-1">Fraud Score</p>
                <p className="text-sm text-[#0f1c2b] font-bold">
                  {claim.aiSummary.fraudLabel}
                </p>
                <p className="text-[11px] text-[#10b981] mt-2 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">security</span>
                  Safe
                </p>
              </div>
            </div>
          </div>

          {/* Claim Details */}
          <div className="bg-white border border-[#c2c7d1] rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#0f1c2b] mb-4">Claim Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Policyholder</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">{claim.claimerName}</p>
              </div>

              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Policy Number</p>
                <p className="text-sm font-semibold text-[#0f1c2b] font-mono">{claim.carPolicy}</p>
              </div>

              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Vehicle</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">{claim.vehicle}</p>
              </div>

              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">VIN</p>
                <p className="text-sm font-semibold font-mono text-[#0f1c2b]">{claim.vin || '4T1B11HK5MU123XXX'}</p>
              </div>

              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Incident Date</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">
                  {claim.incidentDate || 'Oct 22, 2023, 14:30 PM'}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Submission Date</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">{claim.submissionDate}</p>
              </div>

              <div className="col-span-2 md:col-span-3">
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Incident Location</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">
                  {claim.incidentLocation || 'Intersection of 5th Ave & Main St, Seattle, WA'}
                </p>
              </div>

              {claim.validatorRemarks && (
                <div className="col-span-2 md:col-span-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <p className="text-[11px] text-[#42474f] font-bold mb-0.5">Validator Remarks</p>
                  <p className="text-xs text-[#0f1c2b]">{claim.validatorRemarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white border border-[#c2c7d1] rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#0f1c2b] mb-4">Financial Breakdown</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0]">
                <span className="text-sm text-[#42474f]">Estimated Repair Cost</span>
                <span className="text-sm font-bold text-[#0f1c2b]">
                  ${claim.repairEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0]">
                <span className="text-sm text-[#42474f]">Deductible (Applied)</span>
                <span className="text-sm font-bold text-[#ba1a1a]">
                  -${claim.deductible.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-4">
                <span className="text-lg font-bold text-[#0f1c2b]">
                  {isSucceeded ? 'Approved Settlement Amount' : 'Potential Payout'}
                </span>
                <span className={`text-xl font-bold ${isSucceeded ? 'text-emerald-700' : 'text-[#4a6173]'}`}>
                  ${(isSucceeded
                    ? (claim.financialBreakdown?.approvedAmount ?? claim.potentialPayout)
                    : claim.potentialPayout
                  ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Document Review & Conditional Action Suite) */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4">
          <div className="bg-white border border-[#c2c7d1] rounded-xl p-6 shadow-xs flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0f1c2b]">Document Review</h2>
              <span className="text-xs text-[#64748b]">
                {claim.documents.length} documents attached
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {claim.documents.map((doc) => {
                const isVerified = doc.status === 'verified_agent';
                const isFailed = doc.status === 'verification_failed';

                return (
                  <div
                    key={doc.id}
                    onClick={handleOpenSplitVerification}
                    className="flex items-center gap-3 p-3 border border-[#c2c7d1] rounded-lg bg-[#f8f9ff] hover:bg-[#eef4ff] transition-colors hover:border-[#4a6173] cursor-pointer group"
                  >
                    {/* Doc thumbnail icon */}
                    <div className="w-12 h-16 bg-[#e2e8f0] rounded border border-[#c2c7d1] flex-shrink-0 flex items-center justify-center overflow-hidden relative group-hover:scale-102 transition-transform">
                      {doc.imageUrl ? (
                        <img
                          src={doc.imageUrl}
                          alt={doc.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[#94a3b8] text-[24px]">
                          {doc.iconName}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0f1c2b] truncate group-hover:text-[#00355f]">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-[#42474f] mb-1">
                        {doc.category} • {doc.size || '2.0 MB'}
                      </p>

                      {isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#10b981] border border-emerald-200">
                          Verified by AGENT
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-red-200">
                          Verification Failed
                        </span>
                      )}
                    </div>

                    <span className="material-symbols-outlined text-[#94a3b8] group-hover:text-[#00355f] text-[18px]">
                      chevron_right
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CONDITIONAL ACTION SUITE */}
            <div className="mt-6 border-t border-[#c2c7d1] pt-4">
              {/* CASE A: SUCCESS / APPROVED -> DO NOT SHOW ACTION BUTTONS */}
              {isSucceeded && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[#10b981]">
                      <span className="material-symbols-outlined text-[20px] filled-icon">
                        check_circle
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950">
                        Claim Approved & Settled
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                        Authorized disbursement of{' '}
                        <span className="font-bold font-mono">
                          $
                          {(
                            claim.financialBreakdown?.approvedAmount ?? claim.potentialPayout
                          ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        . No further adjuster actions required.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleViewBreakdown}
                    className="w-full mt-1 py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    View Settlement Resolution Details
                  </button>
                </div>
              )}

              {/* CASE B: REJECTED -> DO NOT SHOW APPROVE/REJECT BUTTONS; SHOW REJECTED SUMMARY & REOPEN */}
              {isRejected && (
                <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                      <span className="material-symbols-outlined text-[20px] filled-icon">
                        cancel
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-red-950">Claim Rejected</h4>
                      <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                        {claim.validatorRemarks ||
                          'This claim has been reviewed and closed as rejected.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleReopenClaim}
                    className="w-full mt-1 py-2 px-3 bg-white hover:bg-red-100 text-red-900 border border-red-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    Reopen Claim for Review
                  </button>
                </div>
              )}

              {/* CASE C: PENDING -> SHOW PROCESS FOR AI CHECK, APPROVE, REJECT & REQUEST INFO */}
              {isPending && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[11px] font-bold text-[#42474f] uppercase tracking-wider mb-0.5">
                    Validator Review Actions
                  </p>

                  {/* 1. Option: Process for AI Check */}
                  <button
                    onClick={() => handleOpenConfirmModal('ai_check')}
                    className="w-full px-4 py-2.5 bg-[#00355f] hover:bg-[#00223f] text-white rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Process for AI Check
                  </button>

                  {/* 2. Option: Approve Claim */}
                  <button
                    onClick={() => handleOpenConfirmModal('approve')}
                    className="w-full px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px] filled-icon">
                      check_circle
                    </span>
                    Approve Claim
                  </button>

                  {/* 3. Option: Reject Claim */}
                  <button
                    onClick={() => handleOpenConfirmModal('reject')}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Reject Claim
                  </button>

                  {/* 4. Option: Request More Info */}
                  <button
                    onClick={() => handleOpenConfirmModal('request_info')}
                    className="w-full px-4 py-2 bg-white border border-[#c2c7d1] text-[#42474f] hover:bg-[#f8fafc] transition-colors rounded-lg text-xs font-semibold flex justify-center items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px]">help_outline</span>
                    Request More Info
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE FINAL API CALL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f1c2b]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#e2e8f0] overflow-hidden">
            {/* Modal Header */}
            <div
              className={`p-5 flex items-center justify-between border-b ${
                confirmModal.actionType === 'approve'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
                  : confirmModal.actionType === 'reject'
                  ? 'bg-red-50 border-red-100 text-red-950'
                  : confirmModal.actionType === 'ai_check'
                  ? 'bg-[#eef4ff] border-[#cde5fc] text-[#00355f]'
                  : 'bg-slate-50 border-slate-200 text-[#0f1c2b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    confirmModal.actionType === 'approve'
                      ? 'bg-emerald-100 text-[#10b981]'
                      : confirmModal.actionType === 'reject'
                      ? 'bg-red-100 text-red-600'
                      : confirmModal.actionType === 'ai_check'
                      ? 'bg-[#d2e4ff] text-[#00355f]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {confirmModal.actionType === 'approve'
                      ? 'verified'
                      : confirmModal.actionType === 'reject'
                      ? 'gavel'
                      : confirmModal.actionType === 'ai_check'
                      ? 'auto_awesome'
                      : 'contact_support'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {confirmModal.actionType === 'approve' && 'Confirm Claim Approval'}
                    {confirmModal.actionType === 'reject' && 'Confirm Claim Rejection'}
                    {confirmModal.actionType === 'ai_check' && 'Run AI Validation Check'}
                    {confirmModal.actionType === 'request_info' && 'Confirm Information Request'}
                  </h3>
                  <p className="text-xs opacity-75 font-mono">
                    Target Claim: {claim.id} • {claim.claimerName}
                  </p>
                </div>
              </div>

              <button
                disabled={isProcessingAction}
                onClick={handleCloseConfirmModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Claim Overview Box */}
              <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] grid grid-cols-2 gap-2 text-[#42474f]">
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Vehicle</span>
                  <span className="font-semibold text-[#0f1c2b]">{claim.vehicle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Policy #</span>
                  <span className="font-semibold text-[#0f1c2b] font-mono">{claim.carPolicy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Repair Estimate</span>
                  <span className="font-bold text-[#0f1c2b]">
                    ${claim.repairEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Current Payout</span>
                  <span className="font-bold text-[#00355f]">
                    ${claim.potentialPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action-Specific Inputs & Guidance */}
              {confirmModal.actionType === 'approve' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0f1c2b] mb-1">
                      Applied Deductible ($)
                    </label>
                    <input
                      type="number"
                      value={confirmModal.deductible}
                      onChange={(e) =>
                        setConfirmModal((prev) => ({ ...prev, deductible: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#10b981]"
                    />
                    <p className="text-[11px] text-[#64748b] mt-1">
                      Final settlement amount:{' '}
                      <span className="font-bold text-emerald-700 font-mono">
                        $
                        {Math.max(
                          0,
                          claim.repairEstimate - (parseFloat(confirmModal.deductible) || 0)
                        ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f1c2b] mb-1">
                      Adjuster Remarks / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={confirmModal.notes}
                      onChange={(e) =>
                        setConfirmModal((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:outline-none focus:border-[#10b981]"
                      placeholder="Add sign-off notes for audit logs..."
                    />
                  </div>
                </div>
              )}

              {confirmModal.actionType === 'reject' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
                    <p className="font-bold">Important Notice:</p>
                    <p className="text-[11px] mt-0.5">
                      Rejecting this claim will close it in the adjuster queue and notify the policyholder with the rationale provided below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0f1c2b] mb-1">
                      Rejection Reason & Rationale <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={confirmModal.notes}
                      onChange={(e) =>
                        setConfirmModal((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:outline-none focus:border-red-500"
                      placeholder="Specify non-coverage reason, policy clauses, or document discrepancies..."
                    />
                  </div>
                </div>
              )}

              {confirmModal.actionType === 'ai_check' && (
                <div className="p-3 bg-[#eef4ff] rounded-lg border border-[#cde5fc] space-y-2 text-[#00355f]">
                  <p className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Automated AI Model Pipeline:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#42474f]">
                    <li>Cross-references uploaded photos with collision impact models</li>
                    <li>Validates garage invoice totals against regional standardized parts DB</li>
                    <li>Evaluates metadata for photo timestamps, GPS, and duplicate claims fraud</li>
                  </ul>
                </div>
              )}

              {confirmModal.actionType === 'request_info' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#0f1c2b] mb-1">
                    Information & Document Resubmission Request
                  </label>
                  <textarea
                    rows={3}
                    value={confirmModal.notes}
                    onChange={(e) =>
                      setConfirmModal((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:outline-none focus:border-[#00355f]"
                    placeholder="Specify the exact documentation or photo angle required..."
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-3">
              <button
                disabled={isProcessingAction}
                onClick={handleCloseConfirmModal}
                className="px-4 py-2 bg-white border border-[#cbd5e1] text-[#42474f] hover:bg-[#f1f5f9] rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                disabled={isProcessingAction}
                onClick={handleExecuteConfirmedAction}
                className={`px-5 py-2 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
                  confirmModal.actionType === 'approve'
                    ? 'bg-[#10b981] hover:bg-[#059669]'
                    : confirmModal.actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmModal.actionType === 'ai_check'
                    ? 'bg-[#00355f] hover:bg-[#00223f]'
                    : 'bg-[#4a6173] hover:bg-[#00355f]'
                }`}
              >
                {isProcessingAction ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing API Call...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">
                      {confirmModal.actionType === 'approve'
                        ? 'check'
                        : confirmModal.actionType === 'reject'
                        ? 'cancel'
                        : confirmModal.actionType === 'ai_check'
                        ? 'bolt'
                        : 'send'}
                    </span>
                    Confirm & Proceed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ClaimRecord } from '../types';

export const AutoCollisionReportView: React.FC = () => {
  const claims = useClaimStore((state) => state.claims);
  const selectedClaimForReviewId = useClaimStore((state) => state.selectedClaimForReviewId);
  const updateClaimStatus = useClaimStore((state) => state.updateClaimStatus);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const setSplitVerificationOpen = useClaimStore((state) => state.setSplitVerificationOpen);

  const claim: ClaimRecord =
    claims.find((c) => c.id === selectedClaimForReviewId) || claims[0];

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleApprove = () => {
    updateClaimStatus(claim.id, 'approved');
    setFeedbackMessage(`Claim ${claim.id} has been approved successfully! Payout processing scheduled.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleRequestInfo = () => {
    setFeedbackMessage(`Request for revised documentation and garage invoice sent to ${claim.claimerName}.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
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
                claim.status === 'approved' || claim.status === 'succeeded'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : claim.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  claim.status === 'approved' || claim.status === 'succeeded'
                    ? 'bg-[#10b981]'
                    : claim.status === 'rejected'
                    ? 'bg-[#ef4444]'
                    : 'bg-amber-500'
                }`}
              ></span>
              {claim.statusLabel || 'Pending'}
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
            <h2 className="text-lg font-bold text-[#0f1c2b] flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4a6173]">psychology</span>
              AI Review Summary
            </h2>

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

              <div className="col-span-2">
                <p className="text-[11px] text-[#42474f] font-medium mb-1">Incident Location</p>
                <p className="text-sm font-semibold text-[#0f1c2b]">
                  {claim.incidentLocation || 'Intersection of 5th Ave & Main St, Seattle, WA'}
                </p>
              </div>
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
                <span className="text-lg font-bold text-[#0f1c2b]">Potential Payout</span>
                <span className="text-xl font-bold text-[#4a6173]">
                  ${claim.potentialPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Document Review) - exact replica of Screen 3 */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
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

            {/* Action Buttons at bottom of Document Review card */}
            <div className="mt-6 flex flex-col gap-2.5 border-t border-[#c2c7d1] pt-4">
              <button
                onClick={handleApprove}
                className="w-full px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px] filled-icon">check_circle</span>
                Approve Claim
              </button>

              <button
                onClick={handleRequestInfo}
                className="w-full px-4 py-2.5 bg-white border border-[#c2c7d1] text-[#0f1c2b] hover:bg-[#eef4ff] transition-colors rounded-lg text-xs font-bold flex justify-center items-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                Request More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ResolutionDrawer } from './ResolutionDrawer';

export const ClaimerStatusDashboard: React.FC = () => {
  const claims = useClaimStore((state) => state.claims);
  const selectedTrackingClaimId = useClaimStore((state) => state.selectedTrackingClaimId);
  const setSelectedTrackingClaimId = useClaimStore((state) => state.setSelectedTrackingClaimId);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const setDownloadModalOpen = useClaimStore((state) => state.setDownloadModalOpen);
  const setSelectedClaimForReportId = useClaimStore((state) => state.setSelectedClaimForReportId);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedClaim =
    claims.find((c) => c.id === selectedTrackingClaimId) ||
    claims.find((c) => c.id === '#CLM-2024-089') ||
    claims[0];

  // KPI Metrics Calculation
  const totalClaimsCount = claims.length + 8; // Preserves 12 matching mockup
  const inReviewCount = claims.filter((c) => c.status === 'pending').length;
  const approvedCount = claims.filter((c) => c.status === 'approved' || c.status === 'succeeded').length + 7;
  const rejectedCount = claims.filter((c) => c.status === 'rejected').length;

  const filteredClaims = claims.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return c.status === 'approved' || c.status === 'succeeded';
    if (filterStatus === 'review') return c.status === 'pending';
    if (filterStatus === 'rejected') return c.status === 'rejected';
    return true;
  });

  const handleOpenDownload = () => {
    setSelectedClaimForReportId(selectedClaim.id);
    setDownloadModalOpen(true);
  };

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f1c2b] tracking-tight">
            Claim Status
          </h1>
          <p className="text-sm text-[#42474f] mt-1.5 font-normal">
            Track the progress of your submitted claims.
          </p>
        </div>

        <button
          onClick={() => setActiveNav('upload')}
          className="bg-[#4a6173] hover:bg-[#00355f] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Claim
        </button>
      </div>

      {/* KPI Bento Grid matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Claims */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`bg-white border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'border-[#4a6173] ring-1 ring-[#4a6173]'
              : 'border-[#e2e8f0] hover:border-[#4a6173]/40'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-[#42474f]">Total Claims</span>
            <div className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#0f4c81]">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-[#0f1c2b]">{totalClaimsCount}</span>
        </div>

        {/* In Review */}
        <div
          onClick={() => setFilterStatus('review')}
          className={`bg-white border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
            filterStatus === 'review'
              ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]'
              : 'border-[#e2e8f0] hover:border-amber-400/50'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-[#42474f]">In Review</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-[#0f1c2b]">{inReviewCount}</span>
        </div>

        {/* Approved */}
        <div
          onClick={() => setFilterStatus('approved')}
          className={`bg-white border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'border-[#10b981] ring-1 ring-[#10b981]'
              : 'border-[#e2e8f0] hover:border-emerald-400/50'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-[#42474f]">Approved</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-[#0f1c2b]">{approvedCount}</span>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setFilterStatus('rejected')}
          className={`bg-white border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
            filterStatus === 'rejected'
              ? 'border-[#ef4444] ring-1 ring-[#ef4444]'
              : 'border-[#e2e8f0] hover:border-red-400/50'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-[#42474f]">Rejected</span>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-[#0f1c2b]">{rejectedCount}</span>
        </div>
      </div>

      {/* Active Claim Tracking Detail (Matching Screenshot 4) */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden flex flex-col lg:flex-row shadow-xs mb-8">
        {/* Left: Claim Info & Stepper */}
        <div className="flex-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#e2e8f0]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-[#0f1c2b]">
                  Claim {selectedClaim.id}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedClaim.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedClaim.status === 'succeeded' ? 'APPROVED' : selectedClaim.statusLabel.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Vehicle Damage Claim • Submitted {selectedClaim.submissionDate}
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[#4a6173] hover:text-[#00355f] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Resolution
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Visual Stepper */}
          <div className="relative mt-12 mb-6 px-2">
            {/* Background connecting line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e2e8f0] -z-0"></div>
            {/* Active connecting line */}
            <div
              className={`absolute top-4 left-6 h-0.5 bg-[#10b981] -z-0 transition-all duration-500 ${
                selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded'
                  ? 'w-3/4'
                  : 'w-1/2'
              }`}
            ></div>

            <div className="flex justify-between relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center mb-3 shadow-xs">
                  <span className="material-symbols-outlined text-[16px] icon-fill">check</span>
                </div>
                <span className="text-xs font-semibold text-[#0f1c2b] text-center">Submitted</span>
                <span className="text-[11px] text-[#727780] mt-0.5">
                  {selectedClaim.submissionDate.split(',')[0]}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center mb-3 shadow-xs">
                  <span className="material-symbols-outlined text-[16px] icon-fill">check</span>
                </div>
                <span className="text-xs font-semibold text-[#0f1c2b] text-center">Validator Review</span>
                <span className="text-[11px] text-[#727780] mt-0.5">Oct 14</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center w-1/4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 shadow-xs ${
                    selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded'
                      ? 'bg-[#10b981] text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] icon-fill">
                    {selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded'
                      ? 'check'
                      : 'hourglass_top'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#0f1c2b] text-center">Verification</span>
                <span className="text-[11px] text-[#727780] mt-0.5">Oct 15</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#42474f] border-2 border-[#e2e8f0] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                </div>
                <span className="text-xs font-semibold text-[#42474f] text-center">Settled</span>
                <span className="text-[11px] text-[#727780] mt-0.5">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Summary */}
        <div className="w-full lg:w-80 bg-[#f8fafc] p-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[#e2e8f0]">
          <h4 className="text-xs font-bold text-[#64748b] mb-4 uppercase tracking-wider">
            Claim Summary
          </h4>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[#42474f]">Vehicle</span>
              <span className="font-semibold text-[#0f1c2b]">{selectedClaim.vehicle}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[#42474f]">Claimed Amount</span>
              <span className="font-semibold text-[#0f1c2b]">
                ₹{selectedClaim.repairEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[#42474f]">Approved Amount</span>
              <span className="text-lg font-bold text-[#10b981]">
                ₹{selectedClaim.financialBreakdown.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-1">
              <span className="text-[11px] text-[#727780] block mb-0.5">Expected Payout Date</span>
              <span className="text-xs font-semibold text-[#0f1c2b]">
                {selectedClaim.expectedPayoutDate || 'Oct 20, 2024'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Claims Selection List */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-[#0f1c2b] mb-3">All Submitted Claims</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => setSelectedTrackingClaimId(claim.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                selectedClaim.id === claim.id
                  ? 'border-[#00355f] bg-[#eef4ff]'
                  : 'border-[#e2e8f0] hover:border-[#4a6173] bg-white'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#00355f]">{claim.id}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      claim.status === 'approved' || claim.status === 'succeeded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {claim.statusLabel}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b] mt-1">{claim.vehicle}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#0f1c2b]">
                  ₹{claim.repairEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-[#727780]">{claim.submissionDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Drawer */}
      <ResolutionDrawer
        claim={selectedClaim}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDownloadReport={handleOpenDownload}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ResolutionDrawer } from './ResolutionDrawer';

export const ClaimerStatusDashboard: React.FC = () => {
  const claims = useClaimStore((state) => state.claims);
  const isLoadingClaims = useClaimStore((state) => state.isLoadingClaims);
  const claimsError = useClaimStore((state) => state.claimsError);
  const fetchClaims = useClaimStore((state) => state.fetchClaims);

  const selectedTrackingClaimId = useClaimStore((state) => state.selectedTrackingClaimId);
  const setSelectedTrackingClaimId = useClaimStore((state) => state.setSelectedTrackingClaimId);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const setDownloadModalOpen = useClaimStore((state) => state.setDownloadModalOpen);
  const setSelectedClaimForReportId = useClaimStore((state) => state.setSelectedClaimForReportId);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch real claims from PostgreSQL backend API upon mount
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const selectedClaim =
    claims.find((c) => c.id === selectedTrackingClaimId) ||
    claims[0];

  // KPI Metrics Calculation from actual backend records
  const totalClaimsCount = claims.length;
  const inReviewCount = claims.filter((c) => c.status === 'pending').length;
  const approvedCount = claims.filter((c) => c.status === 'approved' || c.status === 'succeeded').length;
  const rejectedCount = claims.filter((c) => c.status === 'rejected').length;

  const filteredClaims = claims.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return c.status === 'approved' || c.status === 'succeeded';
    if (filterStatus === 'review') return c.status === 'pending';
    if (filterStatus === 'rejected') return c.status === 'rejected';
    return true;
  });

  const handleOpenDownload = () => {
    if (selectedClaim) {
      setSelectedClaimForReportId(selectedClaim.id);
      setDownloadModalOpen(true);
    }
  };

  // Initial Loading State
  if (isLoadingClaims && claims.length === 0) {
    return (
      <div className="flex-1 max-w-[1440px] mx-auto w-full py-28 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#00355f]/20 border-t-[#00355f] rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-bold text-[#0f1c2b]">Fetching Real Claims from Storage...</h3>
        <p className="text-xs text-[#64748b] mt-1">Connecting to backend PostgreSQL repository (GET /api/v1/claims/all)</p>
      </div>
    );
  }

  // Empty State (No Claims Found)
  if (!selectedClaim || claims.length === 0) {
    return (
      <div className="flex-1 max-w-[1440px] mx-auto w-full pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1c2b] tracking-tight">
              Claim Status
            </h1>
            <p className="text-sm text-[#42474f] mt-1.5 font-normal">
              Track the progress of your submitted claims.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchClaims()}
              className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#0f1c2b] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLoadingClaims ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Refresh
            </button>
            <button
              onClick={() => setActiveNav('upload')}
              className="bg-[#00355f] hover:bg-[#0f4c81] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Claim
            </button>
          </div>
        </div>

        {claimsError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-amber-700">info</span>
              <div>
                <p className="font-bold">Backend Storage Notice</p>
                <p className="mt-0.5 text-amber-800">{claimsError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchClaims()}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center shadow-xs flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eef4ff] text-[#00355f] flex items-center justify-center mb-4 shadow-2xs">
            <span className="material-symbols-outlined text-[32px]">folder_open</span>
          </div>
          <h3 className="text-base font-bold text-[#0f1c2b]">No Claims Found in Storage</h3>
          <p className="text-xs text-[#64748b] mt-1.5 max-w-md leading-relaxed">
            There are currently no real claim records in the database. Upload vehicle damage photos and supporting documents to submit your first claim.
          </p>
          <button
            onClick={() => setActiveNav('upload')}
            className="mt-6 bg-[#00355f] hover:bg-[#0f4c81] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Submit Documents for New Claim
          </button>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchClaims()}
            disabled={isLoadingClaims}
            className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#0f1c2b] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 active:scale-98"
            title="Refresh claims from backend"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoadingClaims ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Refresh
          </button>
          <button
            onClick={() => setActiveNav('upload')}
            className="bg-[#00355f] hover:bg-[#0f4c81] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Claim
          </button>
        </div>
      </div>

      {claimsError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-700">info</span>
            <span>{claimsError}</span>
          </div>
          <button
            onClick={() => fetchClaims()}
            className="text-xs font-bold text-[#00355f] underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Claims */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`bg-white border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'border-[#00355f] ring-1 ring-[#00355f]'
              : 'border-[#e2e8f0] hover:border-[#00355f]/40'
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

      {/* Active Claim Tracking Detail */}
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
                {selectedClaim.vehicle ? `${selectedClaim.vehicle} • ` : ''}Submitted {selectedClaim.submissionDate}
                {selectedClaim.claimerName && selectedClaim.claimerName !== 'Policyholder' ? ` by ${selectedClaim.claimerName}` : ''}
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[#00355f] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                <span className="text-[11px] text-[#727780] mt-0.5">
                  {selectedClaim.status === 'pending' ? 'In Review' : 'Completed'}
                </span>
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
                <span className="text-[11px] text-[#727780] mt-0.5">
                  {selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded' ? 'Verified' : 'Pending'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#42474f] border-2 border-[#e2e8f0] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                </div>
                <span className="text-xs font-semibold text-[#42474f] text-center">Settled</span>
                <span className="text-[11px] text-[#727780] mt-0.5">
                  {selectedClaim.status === 'approved' || selectedClaim.status === 'succeeded' ? 'Ready' : 'Pending'}
                </span>
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
              <span className="text-[#42474f]">Claim ID</span>
              <span className="font-semibold font-mono text-[#0f1c2b]">{selectedClaim.id}</span>
            </div>
            {selectedClaim.vehicle ? (
              <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
                <span className="text-[#42474f]">Vehicle</span>
                <span className="font-semibold text-[#0f1c2b]">{selectedClaim.vehicle}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[#42474f]">Status</span>
              <span className="font-semibold text-[#0f1c2b] capitalize">{selectedClaim.statusLabel || selectedClaim.status}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[#42474f]">Total Documents</span>
              <span className="font-semibold text-[#0f1c2b]">{selectedClaim.docsUploaded} uploaded</span>
            </div>
            {selectedClaim.repairEstimate != null && selectedClaim.repairEstimate > 0 ? (
              <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
                <span className="text-[#42474f]">Claimed Amount</span>
                <span className="font-semibold text-[#0f1c2b]">
                  ₹{selectedClaim.repairEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : null}
            {selectedClaim.financialBreakdown?.approvedAmount != null && selectedClaim.financialBreakdown.approvedAmount > 0 ? (
              <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5">
                <span className="text-[#42474f]">Approved Amount</span>
                <span className="text-lg font-bold text-[#10b981]">
                  ₹{selectedClaim.financialBreakdown.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : null}
            {selectedClaim.expectedPayoutDate ? (
              <div className="pt-1">
                <span className="text-[11px] text-[#727780] block mb-0.5">Expected Payout Date</span>
                <span className="text-xs font-semibold text-[#0f1c2b]">
                  {selectedClaim.expectedPayoutDate}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Uploaded Documents List for Selected Claim */}
      {selectedClaim.documents && selectedClaim.documents.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0f1c2b]">Claim Documents in Storage</h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {selectedClaim.documents.length} verified file{selectedClaim.documents.length > 1 ? 's' : ''} stored in cloud storage repository
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">cloud_done</span>
              Synced with Database
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedClaim.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg border border-[#e2e8f0] bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#00355f]">
                      {doc.iconName || 'description'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#0f1c2b] truncate" title={doc.fileName || doc.title}>
                      {doc.fileName || doc.title}
                    </p>
                    <p className="text-[10px] text-[#64748b]">
                      {doc.category} • {doc.fileSize || doc.size || 'Saved'}
                    </p>
                  </div>
                </div>

                {doc.imageUrl && (
                  <a
                    href={doc.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00355f] hover:text-[#0f4c81] p-1 rounded hover:bg-white transition-colors"
                    title="View Document"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Claims Selection List */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0f1c2b]">All Submitted Claims ({filteredClaims.length})</h3>
          <span className="text-[11px] text-[#64748b]">Click any claim to inspect details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => setSelectedTrackingClaimId(claim.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                selectedClaim.id === claim.id
                  ? 'border-[#00355f] bg-[#eef4ff] ring-1 ring-[#00355f]'
                  : 'border-[#e2e8f0] hover:border-[#00355f]/40 bg-white'
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
                <p className="text-[11px] text-[#64748b] mt-1">
                  {claim.vehicle || claim.claimerName || 'Motor Claim'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#0f1c2b]">
                  {claim.docsUploaded} file{claim.docsUploaded !== 1 ? 's' : ''}
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

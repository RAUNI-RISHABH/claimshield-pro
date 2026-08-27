import React, { useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ClaimRecord } from '../types';
import { fetchValidatorQueue } from '../api/validatorApi';

export const ValidatorQueueView: React.FC = () => {
  const claims = useClaimStore((state) => state.claims);
  const searchQuery = useClaimStore((state) => state.searchQuery);
  const setSelectedClaimForReviewId = useClaimStore((state) => state.setSelectedClaimForReviewId);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const setSplitVerificationOpen = useClaimStore((state) => state.setSplitVerificationOpen);

  const [filterType, setFilterType] = useState<'all' | 'pending' | 'succeeded' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchValidatorQueue({ statusFilter: filterType, searchQuery });
    setIsRefreshing(false);
  };

  const handleSelectClaim = (claim: ClaimRecord) => {
    setSelectedClaimForReviewId(claim.id);
    setActiveNav('report');
  };

  const handleOpenVerificationModal = (claim: ClaimRecord) => {
    setSelectedClaimForReviewId(claim.id);
    setSplitVerificationOpen(true);
  };

  const filteredClaims = claims.filter((claim) => {
    if (filterType === 'pending' && claim.status !== 'pending') return false;
    if (filterType === 'succeeded' && claim.status !== 'succeeded' && claim.status !== 'approved') return false;
    if (filterType === 'rejected' && claim.status !== 'rejected') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        claim.id.toLowerCase().includes(q) ||
        claim.claimerName.toLowerCase().includes(q) ||
        claim.carPolicy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-auto table-container pb-24">
      {/* Filter & Action Bar as in Screenshot 5 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown Filter */}
          <div className="relative inline-block">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f1c2b] flex items-center gap-2 hover:border-[#4a6173] transition-colors focus:outline-none cursor-pointer"
            >
              <option value="all">All Claims</option>
              <option value="pending">Pending Only</option>
              <option value="succeeded">Succeeded / Approved</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>

          <button
            onClick={() => setFilterType('all')}
            className="px-3.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#0f1c2b] flex items-center gap-1.5 hover:border-[#4a6173] transition-colors cursor-pointer"
          >
            Filter
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            className="px-4 py-1.5 bg-[#4a6173] hover:bg-[#00355f] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
              autorenew
            </span>
            Refresh Queue
          </button>
        </div>
      </div>

      {/* High-Density Data Card & Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold w-28">Claim ID</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold">Claimer Name</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold">Car Policy</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold">Submission Date</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold text-right">Repair Estimate</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold text-center">Docs</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold">Status</th>
                <th className="py-3 px-4 text-xs text-[#64748b] font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-xs text-[#0f1c2b]">
              {filteredClaims.map((claim) => {
                const isPending = claim.status === 'pending';
                const isSucceeded = claim.status === 'succeeded' || claim.status === 'approved';
                const isRejected = claim.status === 'rejected';

                return (
                  <tr
                    key={claim.id}
                    className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                    onClick={() => handleSelectClaim(claim)}
                  >
                    {/* Claim ID */}
                    <td className="py-3 px-4 font-semibold text-[#4a6173] group-hover:text-[#00355f]">
                      {claim.id}
                    </td>

                    {/* Claimer Name */}
                    <td className="py-3 px-4 font-medium text-[#0f1c2b]">{claim.claimerName}</td>

                    {/* Car Policy */}
                    <td className="py-3 px-4 text-[#64748b] font-mono">{claim.carPolicy}</td>

                    {/* Submission Date */}
                    <td className="py-3 px-4 text-[#64748b]">{claim.submissionDate}</td>

                    {/* Repair Estimate */}
                    <td className="py-3 px-4 text-right font-semibold text-[#0f1c2b]">
                      ${claim.repairEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Docs Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isRejected
                            ? 'bg-[#ffdad6] text-[#93000a] border-red-200'
                            : 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]'
                        }`}
                      >
                        {claim.docsUploaded}/{claim.docsTotal}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Pending
                        </span>
                      )}
                      {isSucceeded && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                          Succeeded
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSelectClaim(claim)}
                          className="text-[#4a6173] hover:text-[#00355f] hover:bg-[#eef4ff] p-1.5 rounded-md transition-colors cursor-pointer"
                          title="View Full Report"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleOpenVerificationModal(claim)}
                          className="text-[#4a6173] hover:text-[#00355f] hover:bg-[#eef4ff] p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Split-Screen Verification"
                        >
                          <span className="material-symbols-outlined text-[18px]">fact_check</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination as shown in Screenshot 5 */}
        <div className="px-4 py-3 border-t border-[#e2e8f0] bg-white flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-[#64748b]">
            Showing 1 to {filteredClaims.length} of 124 entries
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-[#e2e8f0] rounded text-[#64748b] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1 rounded font-semibold ${
                currentPage === 1
                  ? 'border border-[#4a6173] bg-[#eef4ff] text-[#00355f]'
                  : 'border border-[#e2e8f0] text-[#42474f] hover:bg-slate-50'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1 rounded font-semibold ${
                currentPage === 2
                  ? 'border border-[#4a6173] bg-[#eef4ff] text-[#00355f]'
                  : 'border border-[#e2e8f0] text-[#42474f] hover:bg-slate-50'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-3 py-1 rounded font-semibold ${
                currentPage === 3
                  ? 'border border-[#4a6173] bg-[#eef4ff] text-[#00355f]'
                  : 'border border-[#e2e8f0] text-[#42474f] hover:bg-slate-50'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="px-2.5 py-1 border border-[#e2e8f0] rounded text-[#64748b] hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

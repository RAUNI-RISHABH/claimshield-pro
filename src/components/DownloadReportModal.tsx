import React from 'react';
import { useClaimStore } from '../store/useClaimStore';

export const DownloadReportModal: React.FC = () => {
  const isOpen = useClaimStore((state) => state.isDownloadModalOpen);
  const setOpen = useClaimStore((state) => state.setDownloadModalOpen);
  const claims = useClaimStore((state) => state.claims);
  const selectedClaimForReportId = useClaimStore((state) => state.selectedClaimForReportId);
  const selectedTrackingClaimId = useClaimStore((state) => state.selectedTrackingClaimId);

  const claimId = selectedClaimForReportId || selectedTrackingClaimId;
  const claim = claims.find((c) => c.id === claimId) || claims[0];

  if (!isOpen || !claim) return null;

  const originalEstimate =
    claim.financialBreakdown?.originalEstimate ?? claim.repairEstimate ?? 0;
  const deductible = claim.financialBreakdown?.deductible ?? claim.deductible ?? 0;
  const consumables = claim.financialBreakdown?.consumables ?? 0;
  const approvedAmount =
    claim.financialBreakdown?.approvedAmount ??
    claim.potentialPayout ??
    Math.max(0, originalEstimate - deductible - consumables);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1c2b]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#00355f] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
            <div>
              <h3 className="font-bold text-base">ClaimShield Pro Resolution Certificate</h3>
              <p className="text-xs text-[#cde5fc]">Claim Reference: {claim.id}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable Report Preview */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0f1c2b]" id="printable-area">
          <div className="flex justify-between items-start border-b border-[#e2e8f0] pb-4">
            <div>
              <h4 className="font-bold text-sm text-[#00355f]">OFFICIAL CLAIM SETTLEMENT NOTICE</h4>
              <p className="text-[#64748b] mt-0.5">Underwritten by ClaimShield Insurance Group</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">
                SETTLEMENT APPROVED
              </span>
              <p className="text-[11px] text-[#64748b] mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
            <div>
              <p className="text-[#64748b] font-medium">Policyholder:</p>
              <p className="font-bold text-sm">{claim.claimerName}</p>
              <p className="text-[#64748b] mt-2">Policy Number:</p>
              <p className="font-mono font-semibold">{claim.carPolicy}</p>
            </div>
            <div>
              <p className="text-[#64748b] font-medium">Vehicle / VIN:</p>
              <p className="font-semibold">{claim.vehicle}</p>
              <p className="font-mono text-[11px] text-[#64748b]">{claim.vin || '4T1B11HK5MU123XXX'}</p>
              <p className="text-[#64748b] mt-2">Expected Payout Date:</p>
              <p className="font-bold text-[#10b981]">{claim.expectedPayoutDate || 'Oct 20, 2024'}</p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs text-[#64748b] uppercase tracking-wider mb-2">
              Financial Itemization
            </h5>
            <table className="w-full text-left border border-[#e2e8f0] rounded overflow-hidden">
              <thead className="bg-[#f1f5f9] text-[#64748b]">
                <tr>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#e2e8f0]">
                  <td className="p-2.5 font-medium">Original Certified Garage Estimate</td>
                  <td className="p-2.5 text-right font-bold">
                    ₹{originalEstimate.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-[#e2e8f0] text-red-600">
                  <td className="p-2.5">Standard Policy Deductible (Section 4.1)</td>
                  <td className="p-2.5 text-right font-bold">
                    -₹{deductible.toFixed(2)}
                  </td>
                </tr>
                {consumables > 0 ? (
                  <tr className="border-t border-[#e2e8f0] text-red-600">
                    <td className="p-2.5">Non-Covered Consumables & Ancillary</td>
                    <td className="p-2.5 text-right font-bold">
                      -₹{consumables.toFixed(2)}
                    </td>
                  </tr>
                ) : null}
                <tr className="border-t-2 border-[#00355f] bg-[#eef4ff] font-bold text-sm">
                  <td className="p-3 text-[#00355f]">Net Approved Payout</td>
                  <td className="p-3 text-right text-[#00355f]">
                    ₹{approvedAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h5 className="font-bold text-xs text-[#64748b] uppercase tracking-wider mb-1">
              Adjuster & Validator Assessment
            </h5>
            <p className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[#334155] italic leading-relaxed">
              "{claim.validatorRemarks || 'Documents and damage inspection verified in full compliance with motor coverage rules.'}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-white border border-[#c2c7d1] rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#00355f] hover:bg-[#0f4c81] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

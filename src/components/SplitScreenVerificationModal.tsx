import React, { useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { HOTLINKED_ASSETS } from '../data';

export const SplitScreenVerificationModal: React.FC = () => {
  const isOpen = useClaimStore((state) => state.isSplitVerificationOpen);
  const setOpen = useClaimStore((state) => state.setSplitVerificationOpen);
  const claims = useClaimStore((state) => state.claims);
  const selectedClaimForReviewId = useClaimStore((state) => state.selectedClaimForReviewId);
  const approveClaim = useClaimStore((state) => state.approveClaim);
  const rejectClaim = useClaimStore((state) => state.rejectClaim);

  const claim = claims.find((c) => c.id === selectedClaimForReviewId) || claims[0];

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [checklist, setChecklist] = useState({
    identityMatch: true,
    policyPeriodActive: true,
    procedureCovered: true,
  });
  const [deductions, setDeductions] = useState<string>('500.00');
  const [notes, setNotes] = useState<string>(
    'Documents verified against policy POL-2023-A491. Frontal collision damages verified with certified repair estimate. Standard policy deductible applied.'
  );

  if (!isOpen) return null;

  const docOptions = [
    {
      id: 'doc-bill-1',
      label: 'Bill 1',
      title: 'Itemized Garage Invoice & Parts',
      image: HOTLINKED_ASSETS.documentBillImage,
      thumb: HOTLINKED_ASSETS.thumbnailBill1,
    },
    {
      id: 'doc-summary',
      label: 'Summary',
      title: 'Police Accident & Collision Report',
      image: HOTLINKED_ASSETS.documentBillImage,
      thumb: HOTLINKED_ASSETS.thumbnailSummary,
    },
    {
      id: 'doc-lab',
      label: 'Photos',
      title: 'Front & Side High-Resolution Damage Photos',
      image: HOTLINKED_ASSETS.carFrontDamage,
      isPdf: false,
    },
  ];

  const currentDoc = docOptions[selectedDocIndex] || docOptions[0];

  const handlePrint = () => {
    window.print();
  };

  const handleApproveAction = () => {
    const numDeductions = parseFloat(deductions) || 0;
    approveClaim(claim.id, numDeductions, notes);
    setOpen(false);
  };

  const handleRejectAction = () => {
    rejectClaim(claim.id, notes);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1c2b]/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl h-[92vh] max-h-[950px] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.12)] flex flex-col overflow-hidden border border-[#e2e8f0]">
        {/* Modal Header matching Screenshot 5 */}
        <div className="px-6 py-3.5 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-bold text-[#0f1c2b]">
              Claim Verification: {claim.id}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Action Required
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-[#64748b] hover:text-[#0f1c2b] hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body (Split Screen Layout) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Interactive Document Viewer */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[#e2e8f0] bg-[#f8fafc] min-h-[360px] lg:min-h-0">
            {/* Main Viewer Canvas */}
            <div className="flex-1 p-4 relative overflow-auto flex items-center justify-center bg-[#f1f5f9] select-none">
              {/* Document Image with zoom scaling */}
              <div
                className="bg-white shadow-sm border border-[#cbd5e1] rounded transition-transform duration-200 max-w-2xl w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden relative"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {currentDoc.image ? (
                  <img
                    src={currentDoc.image}
                    alt={currentDoc.title}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-8">
                    <span className="material-symbols-outlined text-[64px]">picture_as_pdf</span>
                    <p className="text-sm font-semibold text-slate-600 mt-2">{currentDoc.title}</p>
                    <p className="text-xs text-slate-400">PDF Document Stream Ready</p>
                  </div>
                )}
              </div>

              {/* Floating Overlay Controls for Zoom & Print */}
              <div className="absolute top-4 right-4 flex gap-1 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-[#cbd5e1] p-1 z-10">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                  className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                  className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors cursor-pointer"
                  title="Print Document"
                >
                  <span className="material-symbols-outlined text-[20px]">print</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel matching Screenshot 5 */}
            <div className="h-24 bg-white border-t border-[#e2e8f0] p-2 flex gap-3 overflow-x-auto items-center">
              {docOptions.map((doc, idx) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`w-16 h-20 rounded overflow-hidden flex-shrink-0 cursor-pointer relative transition-all ${
                    selectedDocIndex === idx
                      ? 'border-2 border-[#4a6173] ring-2 ring-[#4a6173]/20 shadow-xs'
                      : 'border border-[#cbd5e1] opacity-70 hover:opacity-100'
                  }`}
                >
                  {doc.thumb ? (
                    <img src={doc.thumb} alt={doc.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#64748b] text-[24px]">
                        image
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0f1c2b]/90 text-white text-[10px] font-semibold text-center py-0.5">
                    {doc.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Verification Tools & Inspection Panel */}
          <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col bg-white overflow-y-auto">
            {/* Claimant Details Panel */}
            <div className="p-5 border-b border-[#e2e8f0]">
              <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
                Claimant Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-[#64748b] mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-[#0f1c2b]">{claim.claimerName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748b] mb-0.5">Policy</p>
                  <p className="text-sm font-bold text-[#4a6173]">{claim.carPolicy}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748b] mb-0.5">Incident Type</p>
                  <p className="text-xs font-medium text-[#0f1c2b]">{claim.diagnosisCode || 'Collision Impact'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748b] mb-0.5">Claimed Amount</p>
                  <p className="text-sm font-bold text-[#0f1c2b]">
                    ₹{claim.repairEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-5 border-b border-[#e2e8f0]">
              <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
                Verification Checklist
              </h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={checklist.identityMatch}
                    onChange={(e) =>
                      setChecklist((c) => ({ ...c, identityMatch: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 text-[#4a6173] rounded border-[#cbd5e1] focus:ring-[#4a6173] cursor-pointer"
                  />
                  <span className="text-xs text-[#334155] group-hover:text-[#0f1c2b] leading-tight">
                    Claimant & driver identity matches policy records.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={checklist.policyPeriodActive}
                    onChange={(e) =>
                      setChecklist((c) => ({ ...c, policyPeriodActive: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 text-[#4a6173] rounded border-[#cbd5e1] focus:ring-[#4a6173] cursor-pointer"
                  />
                  <span className="text-xs text-[#334155] group-hover:text-[#0f1c2b] leading-tight">
                    Date of accident falls within active coverage period.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={checklist.procedureCovered}
                    onChange={(e) =>
                      setChecklist((c) => ({ ...c, procedureCovered: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 text-[#4a6173] rounded border-[#cbd5e1] focus:ring-[#4a6173] cursor-pointer"
                  />
                  <span className="text-xs text-[#334155] group-hover:text-[#0f1c2b] leading-tight">
                    Damaged items & labor rates are covered under plan.
                  </span>
                </label>
              </div>
            </div>

            {/* Inputs: Deductions & Notes */}
            <div className="p-5 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Deductions / Adjustments (₹)
                </label>
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-[#4a6173] focus:ring-1 focus:ring-[#4a6173] outline-none bg-white text-[#0f1c2b]"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Enter any non-covered amounts to deduct from total.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Validator Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter findings, anomalies, or reasons for adjustment..."
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-xs leading-relaxed focus:border-[#4a6173] focus:ring-1 focus:ring-[#4a6173] outline-none resize-none bg-white text-[#0f1c2b]"
                />
              </div>
            </div>

            {/* Action Buttons matching Screenshot 5 */}
            <div className="p-5 bg-[#f8fafc] border-t border-[#e2e8f0] flex gap-3 mt-auto">
              <button
                onClick={handleRejectAction}
                className="flex-1 px-4 py-2.5 bg-white border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex justify-center items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Reject
              </button>

              <button
                onClick={handleApproveAction}
                className="flex-1 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px] filled-icon">check_circle</span>
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useClaimStore } from '../store/useClaimStore';

export const ClaimerUploadView: React.FC = () => {
  const slots = useClaimStore((state) => state.uploadSlots);
  const showErrorToast = useClaimStore((state) => state.showErrorToast);
  const setShowErrorToast = useClaimStore((state) => state.setShowErrorToast);
  const isSubmitting = useClaimStore((state) => state.isSubmittingClaim);
  const submitMessage = useClaimStore((state) => state.submitMessage);
  const setSubmitMessage = useClaimStore((state) => state.setSubmitMessage);
  const uploadFileToSlot = useClaimStore((state) => state.uploadFileToSlot);
  const removeFileFromSlot = useClaimStore((state) => state.removeFileFromSlot);
  const completeSlotUpload = useClaimStore((state) => state.completeSlotUpload);
  const saveDraftClaim = useClaimStore((state) => state.saveDraftClaim);
  const submitClaim = useClaimStore((state) => state.submitClaim);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);

  const handleFileUpload = (slotId: string, file: File) => {
    uploadFileToSlot(slotId, file.name);
  };

  const handleRemoveFile = (slotId: string) => {
    removeFileFromSlot(slotId);
  };

  const handleSubmitClaim = () => {
    submitClaim();
  };

  const requiredCount = slots.filter((s) => s.required).length;
  const uploadedRequired = slots.filter(
    (s) => s.required && (s.status === 'uploaded' || s.status === 'uploading')
  ).length;
  const canSubmit = uploadedRequired >= 1;

  return (
    <div className="flex-1 pb-32">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-xs text-[#42474f] mb-2 font-medium">
          <button
            onClick={() => setActiveNav('history')}
            className="hover:text-[#4a6173] transition-colors cursor-pointer"
          >
            Claims
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="hover:text-[#4a6173] transition-colors">Motor Claims</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0f1c2b] font-semibold">Reimbursement</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0f1c2b] tracking-tight">
              Multi-Document Upload
            </h1>
            <p className="text-sm text-[#64748b] mt-1">
              Claim ID: <span className="font-bold text-[#0f1c2b]">#CLM-9821</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4a6173] bg-[#eef4ff] px-3 py-1 rounded-md border border-[#cde5fc] font-medium">
              Required: {uploadedRequired} / {requiredCount} uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submitMessage && (
        <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#10b981] filled-icon">check_circle</span>
            <p className="text-sm text-[#065f46] font-medium">{submitMessage}</p>
          </div>
          <button
            onClick={() => setSubmitMessage(null)}
            className="text-[#065f46] hover:bg-emerald-100 p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Error Toast as shown in Screenshot 1 & 2 */}
      {showErrorToast && (
        <div className="bg-[#ffdad6] border-l-4 border-[#ba1a1a] p-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-layer-2 max-w-2xl">
          <span className="material-symbols-outlined text-[#ba1a1a] filled-icon">error</span>
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-[#93000a] tracking-wide">Upload Error</h3>
            <p className="text-xs text-[#93000a] mt-1 leading-relaxed">
              Car photo is too dark or VIN number not visible. Please re-upload a clear copy.
            </p>
          </div>
          <button
            onClick={() => setShowErrorToast(false)}
            className="text-[#93000a] hover:bg-[#ba1a1a]/10 p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Upload Grid (3 columns on lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const isErrorSlot = slot.borderTheme === 'error' || slot.id === 'slot-1';
          const isWarningSlot = slot.borderTheme === 'warning';
          const isSuccessSlot = slot.borderTheme === 'success';

          let cardClasses = 'bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm transition-all relative ';

          if (slot.status === 'uploading' || isErrorSlot) {
            cardClasses += 'bg-red-50/50 border border-red-200 hover:border-red-400';
          } else if (isWarningSlot && slot.status === 'empty') {
            cardClasses += 'bg-amber-50/40 border-2 border-dashed border-amber-300 hover:border-amber-400 cursor-pointer group';
          } else if (isSuccessSlot && slot.status === 'empty') {
            cardClasses += 'bg-green-50/30 border border-green-200 hover:border-green-300 cursor-pointer group';
          } else if (slot.status === 'uploaded') {
            cardClasses += 'bg-white border border-[#10b981]';
          } else {
            cardClasses += 'border border-[#e2e8f0] hover:border-[#4a6173]';
          }

          return (
            <div key={slot.id} className={cardClasses}>
              {/* Card Top: Icon + Title + Required/Optional */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                      slot.status === 'uploading'
                        ? 'bg-[#4a6173]/10 text-[#4a6173]'
                        : isWarningSlot
                        ? 'bg-amber-100 text-amber-800'
                        : isSuccessSlot
                        ? 'bg-green-100 text-green-800'
                        : 'bg-[#eef4ff] text-[#42474f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{slot.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#0f1c2b]">{slot.title}</h3>
                    <p
                      className={`text-xs ${
                        slot.required ? 'text-[#64748b] font-medium' : 'text-[#64748b]'
                      }`}
                    >
                      {slot.subtitle}
                    </p>
                  </div>
                </div>

                {slot.status === 'uploaded' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#10b981] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="material-symbols-outlined text-[12px] filled-icon">check_circle</span>
                    Uploaded
                  </span>
                )}
              </div>

              {/* Slot Body */}
              {slot.status === 'uploading' ? (
                <div className="bg-[#e5eeff] p-3 rounded border border-[#c2c7d1]/40 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#727780] text-[22px]">image</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#0f1c2b] truncate font-medium">{slot.fileName}</p>
                    <div className="w-full bg-[#d6e4f9] rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-[#4a6173] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${slot.progress || 65}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[11px] text-[#64748b]">Uploading... {slot.progress || 65}%</p>
                      <button
                        onClick={() => completeSlotUpload(slot.id)}
                        className="text-[10px] text-[#00355f] hover:underline font-semibold cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(slot.id)}
                    className="text-[#727780] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer"
                    title="Cancel upload"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ) : slot.status === 'uploaded' ? (
                <div className="bg-[#f8f9ff] p-3 rounded border border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[#10b981] text-[20px]">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#0f1c2b] truncate">{slot.fileName}</p>
                      <p className="text-[11px] text-[#64748b]">Ready for submission</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(slot.id)}
                    className="text-[#727780] hover:text-[#ba1a1a] p-1 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ) : (
                <label
                  className="flex-1 flex flex-col items-center justify-center py-6 text-center cursor-pointer transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(slot.id, e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(slot.id, e.target.files[0]);
                      }
                    }}
                  />
                  <span className="material-symbols-outlined text-[#c2c7d1] mb-2 text-[32px] group-hover:text-[#4a6173] transition-colors">
                    upload_file
                  </span>
                  <p className="text-xs text-[#4a6173] font-semibold group-hover:underline">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-1">{slot.hint}</p>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-[#e2e8f0] p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3 md:gap-4 items-center">
        <button
          onClick={saveDraftClaim}
          className="px-5 md:px-6 py-2 rounded-lg text-xs font-semibold text-[#0f1c2b] border border-[#e2e8f0] hover:bg-[#eef4ff] transition-colors bg-white cursor-pointer active:scale-98"
        >
          Save as Draft
        </button>

        <button
          onClick={handleSubmitClaim}
          disabled={!canSubmit || isSubmitting}
          className={`px-5 md:px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-2 ${
            canSubmit && !isSubmitting
              ? 'bg-[#4a6173] hover:bg-[#00355f] cursor-pointer active:scale-98'
              : 'bg-[#4a6173] opacity-50 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
              Submitting...
            </>
          ) : (
            <>
              Submit Reimbursement Claim
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

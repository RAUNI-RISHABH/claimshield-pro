import React from 'react';
import { useClaimStore } from '../store/useClaimStore';

export const ClaimerUploadView: React.FC = () => {
  const slots = useClaimStore((state) => state.uploadSlots);
  const isSubmitting = useClaimStore((state) => state.isSubmittingClaim);
  const submitMessage = useClaimStore((state) => state.submitMessage);
  const setSubmitMessage = useClaimStore((state) => state.setSubmitMessage);
  const uploadFileToSlot = useClaimStore((state) => state.uploadFileToSlot);
  const removeFileFromSlot = useClaimStore((state) => state.removeFileFromSlot);
  const saveDraftClaim = useClaimStore((state) => state.saveDraftClaim);
  const submitClaim = useClaimStore((state) => state.submitClaim);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);

  const handleFileUpload = (slotId: string, file: File) => {
    uploadFileToSlot(slotId, file);
  };

  const handleRemoveFile = (slotId: string) => {
    removeFileFromSlot(slotId);
  };

  const handleSubmitClaim = () => {
    submitClaim();
  };

  // Validation: Check all required document slots
  const requiredSlots = slots.filter((s) => s.required);
  const validatedRequiredCount = requiredSlots.filter((s) => s.status === 'uploaded').length;
  const hasErrors = slots.some((s) => s.status === 'error');
  const allRequiredValidated = requiredSlots.every((s) => s.status === 'uploaded') && !hasErrors;

  return (
    <div className="flex-1 pb-36 max-w-7xl mx-auto w-full">
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
          <span className="text-[#0f1c2b] font-semibold">Reimbursement Document Portal</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1c2b] tracking-tight">
              Multi-Document Upload & AI Verification
            </h1>
            <p className="text-xs text-[#64748b] mt-1">
              Active Claim Submission ID: <span className="font-bold font-mono text-[#00355f]">#CLM-9821</span> • Motor Policy <span className="font-semibold font-mono">POL-882</span>
            </p>
          </div>

          {/* Dynamic Requirements Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                allRequiredValidated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-[#eef4ff] text-[#00355f] border-[#cde5fc]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {allRequiredValidated ? 'verified' : 'fact_check'}
              </span>
              Required: {validatedRequiredCount} of {requiredSlots.length} Validated
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submitMessage && (
        <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#10b981] filled-icon">check_circle</span>
            <p className="text-xs text-[#065f46] font-medium">{submitMessage}</p>
          </div>
          <button
            onClick={() => setSubmitMessage(null)}
            className="text-[#065f46] hover:bg-emerald-100 p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Document Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {slots.map((slot) => {
          const isError = slot.status === 'error' || !!slot.error;
          const isUploaded = slot.status === 'uploaded';
          const isUploading = slot.status === 'uploading';
          const isEmpty = slot.status === 'empty' && !isError;

          // Card Container Classes
          let cardClasses =
            'rounded-xl p-5 flex flex-col justify-between transition-all duration-200 relative min-h-[260px] ';

          if (isError) {
            cardClasses += 'bg-red-50/60 border-2 border-red-500 shadow-sm ring-1 ring-red-400/30';
          } else if (isUploaded) {
            cardClasses += 'bg-emerald-50/50 border-2 border-[#10b981] shadow-sm ring-1 ring-emerald-300/30';
          } else if (isUploading) {
            cardClasses += 'bg-[#eef4ff] border-2 border-[#00355f] shadow-xs';
          } else {
            // Empty state
            cardClasses += slot.required
              ? 'bg-white border-2 border-dashed border-amber-300 hover:border-amber-400 hover:bg-amber-50/20'
              : 'bg-white border border-[#e2e8f0] hover:border-[#4a6173] hover:bg-slate-50/40';
          }

          return (
            <div key={slot.id} className={cardClasses}>
              {/* Card Header: Icon + Title + Category Tag + Status Badge */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isError
                        ? 'bg-red-100 text-red-700'
                        : isUploaded
                        ? 'bg-emerald-100 text-[#10b981]'
                        : isUploading
                        ? 'bg-[#d2e4ff] text-[#00355f]'
                        : slot.required
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{slot.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0f1c2b] leading-snug">{slot.title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          slot.required ? 'text-amber-700 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {slot.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator Pill */}
                {isUploaded && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <span className="material-symbols-outlined text-[12px] filled-icon">
                      check_circle
                    </span>
                    Validated
                  </span>
                )}
                {isError && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                    <span className="material-symbols-outlined text-[12px]">error</span>
                    Error
                  </span>
                )}
              </div>

              {/* Card Body - In-Card Feedback & Upload Area */}
              <div className="flex-1 flex flex-col justify-center my-2">
                {/* 1. ERROR STATE -> Displays Scrollable Error Container Inside the Card */}
                {isError && (
                  <div className="space-y-3">
                    <div className="bg-white/90 border border-red-200 rounded-lg p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-red-600 text-[18px]">
                          broken_image
                        </span>
                        <p className="text-xs font-semibold text-red-950 truncate">
                          {slot.fileName || 'Uploaded Document'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(slot.id)}
                        className="text-slate-400 hover:text-red-700 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    {/* Scrollable Error Message Container inside Card */}
                    <div className="max-h-32 overflow-y-auto custom-scrollbar p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-950 leading-relaxed font-medium space-y-1">
                      <div className="flex items-center gap-1 text-red-950 font-bold text-[11px] uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[14px] text-red-700">warning</span>
                        Validation Alert
                      </div>
                      <p className="whitespace-pre-wrap font-semibold text-red-950 text-[11px]">{slot.error}</p>
                    </div>

                    {/* In-Card Re-upload Trigger */}
                    <label className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-98">
                      <input
                        type="file"
                        className="hidden"
                        accept={
                          slot.categoryPayload === 'accident_photos'
                            ? 'image/jpeg,image/png,image/jpg,image/webp,image/heic'
                            : 'application/pdf,.pdf'
                        }
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(slot.id, e.target.files[0]);
                          }
                        }}
                      />
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                      Re-upload Document
                    </label>
                  </div>
                )}

                {/* 2. UPLOADED / SUCCESS STATE -> Displays Green Card with In-Card Success Message */}
                {isUploaded && (
                  <div className="space-y-3">
                    <div className="bg-white/95 border border-emerald-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[#10b981] text-[22px]">
                          task
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0f1c2b] truncate">
                            {slot.fileName}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {slot.fileSize || '2.4 MB'} • Verified & Encrypted
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFile(slot.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    {/* In-Card Success Message */}
                    <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#10b981] text-[16px] mt-0.5">
                        check
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {slot.successMessage ||
                          'Document OCR and visual inspection validated successfully for underwriting.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. UPLOADING / PROCESSING STATE */}
                {isUploading && (
                  <div className="bg-white/90 p-4 rounded-lg border border-[#cde5fc] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#00355f]/20 border-t-[#00355f] rounded-full animate-spin"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0f1c2b] truncate">{slot.fileName}</p>
                        <p className="text-[10px] text-[#00355f]">
                          Validating document with AI verification...
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-[#d6e4f9] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#00355f] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${slot.progress || 60}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 4. EMPTY STATE -> Drag & Drop Area */}
                {isEmpty && (
                  <label
                    className="flex-1 flex flex-col items-center justify-center py-6 text-center cursor-pointer transition-colors group"
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
                      accept={
                        slot.categoryPayload === 'accident_photos'
                          ? 'image/jpeg,image/png,image/jpg,image/webp,image/heic'
                          : 'application/pdf,.pdf'
                      }
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(slot.id, e.target.files[0]);
                        }
                      }}
                    />
                    <span className="material-symbols-outlined text-[#94a3b8] mb-2 text-[32px] group-hover:text-[#00355f] group-hover:scale-110 transition-all">
                      cloud_upload
                    </span>
                    <p className="text-xs text-[#00355f] font-bold group-hover:underline">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[11px] text-[#64748b] mt-1">{slot.hint}</p>
                  </label>
                )}
              </div>

              {/* Card Footer Info */}
              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-[#64748b]">
                <span>
                  {slot.categoryPayload === 'accident_photos'
                    ? 'Accepts JPEG, JPG, PNG'
                    : 'Accepts PDF only'}{' '}
                  up to 10MB
                </span>
                {isUploaded && <span className="text-emerald-700 font-bold">Ready</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Bar with Submission API */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-40 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-[#42474f] flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              allRequiredValidated ? 'bg-[#10b981] animate-pulse' : 'bg-amber-500'
            }`}
          ></span>
          <span>
            {allRequiredValidated ? (
              <span className="font-semibold text-emerald-800">
                All required claim documents validated. You may now submit your claim.
              </span>
            ) : (
              <span className="text-slate-600">
                Please upload and validate all required documents ({validatedRequiredCount}/{requiredSlots.length} completed) to submit.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={saveDraftClaim}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#0f1c2b] border border-[#e2e8f0] hover:bg-[#eef4ff] transition-colors bg-white cursor-pointer active:scale-98"
          >
            Save as Draft
          </button>

          {/* SUBMIT BUTTON: Disabled until all required documents uploaded, Green when ready */}
          <button
            onClick={handleSubmitClaim}
            disabled={!allRequiredValidated || isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              allRequiredValidated && !isSubmitting
                ? 'bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer active:scale-98 ring-2 ring-emerald-400/50'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting Claim to API...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {allRequiredValidated ? 'send' : 'lock'}
                </span>
                Submit Reimbursement Claim
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

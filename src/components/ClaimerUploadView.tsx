import React, { useRef, useState } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { formatCategoryTitle } from '../api/claimerApi';

export const ClaimerUploadView: React.FC = () => {
  const carFiles = useClaimStore((state) => state.carFiles);
  const pdfFiles = useClaimStore((state) => state.pdfFiles);
  const uploadCarFiles = useClaimStore((state) => state.uploadCarFiles);
  const uploadPdfFiles = useClaimStore((state) => state.uploadPdfFiles);
  const removeCarFile = useClaimStore((state) => state.removeCarFile);
  const removePdfFile = useClaimStore((state) => state.removePdfFile);
  const clearAllUploads = useClaimStore((state) => state.clearAllUploads);

  const isSubmitting = useClaimStore((state) => state.isSubmittingClaim);
  const submitMessage = useClaimStore((state) => state.submitMessage);
  const setSubmitMessage = useClaimStore((state) => state.setSubmitMessage);
  const submitError = useClaimStore((state) => state.submitError);
  const setSubmitError = useClaimStore((state) => state.setSubmitError);
  const saveDraftClaim = useClaimStore((state) => state.saveDraftClaim);
  const submitClaim = useClaimStore((state) => state.submitClaim);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);

  const [isDraggingCar, setIsDraggingCar] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);

  const carInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Both categories must be loaded to enable claim submission
  const hasCarUploaded = carFiles.length > 0;
  const hasPdfUploaded = pdfFiles.length > 0;
  const bothUploaded = hasCarUploaded && hasPdfUploaded;

  const isUploadingAny =
    carFiles.some((f) => f.status === 'uploading') ||
    pdfFiles.some((f) => f.status === 'uploading');

  const canSubmit = bothUploaded && !isSubmitting && !isUploadingAny;

  return (
    <div className="flex-1 pb-36 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        {/* <nav className="flex items-center gap-2 text-xs text-[#42474f] mb-2 font-medium">
          <button
            onClick={() => setActiveNav('history')}
            className="hover:text-[#00355f] transition-colors cursor-pointer"
          >
            Claims
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="hover:text-[#00355f] transition-colors">Motor Claims</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0f1c2b] font-semibold">Reimbursement Document Portal</span>
        </nav> */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1c2b] tracking-tight">
              Motor Claim Document Upload
            </h1>
            <p className="text-xs text-[#64748b] mt-1">
              Upload required vehicle accident photographs and supporting documents for claim verification.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submitMessage && (
        <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-xs animate-in fade-in">
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

      {/* Failure Notification Alert */}
      {submitError && (
        <div className="bg-[#fef2f2] border-l-4 border-[#ef4444] p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ef4444] text-[20px] mt-0.5">error</span>
            <div>
              <p className="text-xs text-[#991b1b] font-bold">Document Upload to Storage Failed</p>
              <p className="text-xs text-[#b91c1c] font-medium mt-0.5">{submitError}</p>
            </div>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="text-[#991b1b] hover:bg-red-100 p-1 rounded-full cursor-pointer ml-3 shrink-0"
            title="Dismiss error"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Main Two-Box Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* =========================================================================
            BOX 1: REQUIRED DOCUMENTS LIST (Left Column, 5 cols)
            ========================================================================= */}
        <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
          {/* Box 1 Header */}
          <div className="p-5 border-b border-[#e2e8f0] bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00355f] text-white text-xs font-bold">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#0f1c2b]">Required Documents</h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#eef4ff] text-[#00355f] border border-[#cde5fc]">
                3 Required
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
              These documents will be verified by an agent. Please ensure you upload the correct documents; failure to do so can lead to claim rejection.
            </p>
          </div>

          {/* Box 1 Document List Items */}
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-start">
            {/* Document Item 1: Car Photos */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-800">
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[#0f1c2b]">Car Photos (Multiple Images)</h3>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1.5 leading-relaxed">
                    Upload multiple exterior photographs showing vehicle damage covering four sides (front, rear, left, and right panels) as well as close-up damage views.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Item 2: Insurance Policy */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-[#00355f]">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[#0f1c2b]">Insurance Policy</h3>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1.5 leading-relaxed">
                    Active motor insurance policy certificate and schedule document.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Item 3: Repair Invoice & Estimates */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-700">
                  <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[#0f1c2b]">Repair Invoice & Estimates</h3>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1.5 leading-relaxed">
                    Itemized garage tax invoice, repair estimate, or workshop bill detailing replaced parts, labor costs, and GST details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOX 2: DEDICATED UPLOADS (Right Column, 7 cols)
            Section A: Car Photos (Multiple JPEG, JPG, PNG)
            Section B: Supporting Documents (Multiple PDFs)
            ========================================================================= */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
          {/* Box 2 Header */}
          <div className="p-5 border-b border-[#e2e8f0] bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00355f] text-white text-xs font-bold">
                2
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#0f1c2b]">Document Uploads</h2>
                <p className="text-[11px] text-[#64748b]">Upload multiple car photos and multiple supporting PDF documents below</p>
              </div>
            </div>

            {(carFiles.length > 0 || pdfFiles.length > 0) && (
              <button
                onClick={clearAllUploads}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                Clear All
              </button>
            )}
          </div>

          <div className="p-5 space-y-6 flex-1">
            {/* -------------------------------------------------------------
                UPLOAD SECTION 1: CAR PHOTOS (Multiple Images)
                ------------------------------------------------------------- */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">
                    photo_camera
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#0f1c2b]">Car Photos (Multiple Images)</h3>
                    <p className="text-[11px] text-[#64748b]">Upload 4-side vehicle photos and damage close-ups</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    JPEG, JPG, PNG
                  </span>
                  {hasCarUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      {carFiles.length} photo{carFiles.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Car Photos Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCar(true);
                }}
                onDragLeave={() => setIsDraggingCar(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCar(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    uploadCarFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => carInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 bg-white ${isDraggingCar
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20'
                  : 'border-slate-300 hover:border-[#00355f] hover:bg-slate-50'
                  }`}
              >
                <input
                  ref={carInputRef}
                  type="file"
                  multiple
                  accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadCarFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />

                <div className="flex items-center justify-center gap-2 pointer-events-none">
                  <span className="material-symbols-outlined text-amber-600 text-[24px]">
                    add_photo_alternate
                  </span>
                  <span className="text-xs font-bold text-[#0f1c2b]">
                    Click or drag & drop multiple car photos here
                  </span>
                  <span className="text-[11px] text-slate-400">• JPEG, JPG, PNG</span>
                </div>
              </div>

              {/* Car Photos Uploaded List */}
              {carFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  {carFiles.map((fileItem) => {
                    const isError = fileItem.status === 'error';
                    const isValidated = fileItem.status === 'validated';
                    const isUploading = fileItem.status === 'uploading';

                    return (
                      <div
                        key={fileItem.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${isError
                          ? 'bg-red-50/80 border-red-300 text-red-950'
                          : isValidated
                            ? 'bg-white border-emerald-300 text-emerald-950'
                            : 'bg-white border-slate-200'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
                            image
                          </span>
                          <span className="font-semibold truncate">{fileItem.fileName}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {fileItem.fileSize}
                          </span>

                          {isValidated && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                              <span className="material-symbols-outlined text-[12px]">check</span>
                              Vehicle Picture Ready
                            </span>
                          )}

                          {isError && (
                            <span className="text-[10px] font-bold text-red-700 truncate">
                              {fileItem.error || 'Invalid file'}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeCarFile(fileItem.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 cursor-pointer shrink-0"
                          title="Remove photo"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                UPLOAD SECTION 2: SUPPORTING DOCUMENTS (Multiple PDFs)
                ------------------------------------------------------------- */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00355f] text-[20px]">
                    picture_as_pdf
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#0f1c2b]">Supporting Documents (Multiple PDFs)</h3>
                    <p className="text-[11px] text-[#64748b]">Upload insurance policy, repair invoice, estimates, etc.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    PDF only
                  </span>
                  {hasPdfUploaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      {pdfFiles.length} file{pdfFiles.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* PDF Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPdf(true);
                }}
                onDragLeave={() => setIsDraggingPdf(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPdf(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    uploadPdfFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => pdfInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 bg-white ${isDraggingPdf
                  ? 'border-[#00355f] bg-[#eef4ff] ring-2 ring-[#00355f]/20'
                  : 'border-slate-300 hover:border-[#00355f] hover:bg-slate-50'
                  }`}
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadPdfFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />

                <div className="flex items-center justify-center gap-2 pointer-events-none">
                  <span className="material-symbols-outlined text-red-600 text-[24px]">
                    post_add
                  </span>
                  <span className="text-xs font-bold text-[#0f1c2b]">
                    Click or drag & drop multiple supporting PDF files here
                  </span>
                  <span className="text-[11px] text-slate-400">• PDF only</span>
                </div>
              </div>

              {/* PDF Uploaded List */}
              {pdfFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  {pdfFiles.map((fileItem) => {
                    const isError = fileItem.status === 'error';
                    const isValidated = fileItem.status === 'validated';

                    return (
                      <div
                        key={fileItem.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${isError
                          ? 'bg-red-50/80 border-red-300 text-red-950'
                          : isValidated
                            ? 'bg-white border-emerald-300 text-emerald-950'
                            : 'bg-white border-slate-200'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
                            picture_as_pdf
                          </span>
                          <span className="font-semibold truncate">{fileItem.fileName}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {fileItem.fileSize}
                          </span>

                          {isValidated && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                              <span className="material-symbols-outlined text-[12px]">check</span>
                              Document Ready
                            </span>
                          )}

                          {isError && (
                            <span className="text-[10px] font-bold text-red-700 truncate">
                              {fileItem.error || 'Invalid file'}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removePdfFile(fileItem.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 cursor-pointer shrink-0"
                          title="Remove PDF"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-40 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-[#42474f] flex items-center gap-2 w-full sm:w-auto">

        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* <button
            onClick={saveDraftClaim}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold text-[#0f1c2b] border border-[#e2e8f0] hover:bg-[#eef4ff] transition-colors bg-white cursor-pointer active:scale-98"
          >
            Save as Draft
          </button> */}

          {/* SUBMIT BUTTON: Enabled after uploading both car photos and policy/invoice files */}
          <button
            onClick={() => submitClaim()}
            disabled={!canSubmit}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${canSubmit
              ? 'bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer active:scale-98 ring-2 ring-emerald-400/50'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting & Classifying Claim...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {canSubmit ? 'send' : 'lock'}
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


import React from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ClaimerUploadView } from '../components/ClaimerUploadView';
import { ClaimerStatusDashboard } from '../components/ClaimerStatusDashboard';

export const ClaimerModule: React.FC = () => {
  const activeNav = useClaimStore((state) => state.activeNav);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);

  return (
    <div className="w-full">
      {/* Route Views */}
      {activeNav === 'upload' && <ClaimerUploadView />}

      {activeNav === 'history' && <ClaimerStatusDashboard />}

      {activeNav === 'notifications' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 sm:p-8 max-w-3xl shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0f1c2b]">Claimer Activity Alerts</h2>
              <p className="text-xs text-[#64748b] mt-1">
                Real-time updates regarding your active motor claims and settlement approvals.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-[#00355f]">
              2 New
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#eef4ff] rounded-xl border border-[#cde5fc] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#10b981] text-[22px] mt-0.5">
                check_circle
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-[#00355f]">Claim #CLM-2024-089 Settlement Approved</h4>
                  <span className="text-[10px] text-[#64748b]">10m ago</span>
                </div>
                <p className="text-xs text-[#42474f] mt-1 leading-relaxed">
                  Your collision claim of $1,050.00 has been verified by Senior Adjuster Alex Vance and scheduled for direct bank disbursement on Oct 20, 2024.
                </p>
                <button
                  onClick={() => setActiveNav('history')}
                  className="mt-2 text-xs font-bold text-[#00355f] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View in Tracker <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-[22px] mt-0.5">
                warning
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-amber-900">Document Resubmission Alert: Claim #CLM-9821</h4>
                  <span className="text-[10px] text-amber-700">1h ago</span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  The automated damage inspection algorithm detected low lighting in the front bumper photo. Please ensure VIN is clearly legible.
                </p>
                <button
                  onClick={() => setActiveNav('upload')}
                  className="mt-2 text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Upload New Photo <span className="material-symbols-outlined text-[14px]">upload</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeNav === 'support' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 sm:p-8 max-w-3xl shadow-xs">
          <h2 className="text-xl font-bold text-[#0f1c2b] mb-2">ClaimShield Support Center</h2>
          <p className="text-xs text-[#64748b] mb-6 leading-relaxed">
            Need immediate help submitting garage invoices, towing receipts, or reviewing deductible clauses?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-8">
            <div className="p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-start gap-3">
              <div className="p-2.5 bg-[#eef4ff] text-[#00355f] rounded-lg">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0f1c2b]">24/7 Motor Hotline</h4>
                <p className="text-[#64748b] mt-1">1-800-555-CLAIM (2524)</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Average wait: &lt; 1 min</p>
              </div>
            </div>

            <div className="p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-start gap-3">
              <div className="p-2.5 bg-[#eef4ff] text-[#00355f] rounded-lg">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0f1c2b]">Claims Support Desk</h4>
                <p className="text-[#64748b] mt-1">support@claimshieldpro.internal</p>
                <p className="text-[11px] text-[#64748b] mt-1">Response time: ~2 hours</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-xs text-[#0f1c2b] uppercase tracking-wider mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
              <p className="font-bold text-[#0f1c2b]">What documents do I need to file a collision claim?</p>
              <p className="text-[#64748b] mt-1 leading-relaxed">
                You will need your itemized garage repair invoice, the police accident FIR summary, front/side damage photos, and proof of driver ID.
              </p>
            </div>
            <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
              <p className="font-bold text-[#0f1c2b]">How quickly are approved claims disbursed?</p>
              <p className="text-[#64748b] mt-1 leading-relaxed">
                Once validated and approved by an authorized adjuster, automated direct deposits are processed within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimerModule;

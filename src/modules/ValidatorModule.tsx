import React from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { ValidatorQueueView } from '../components/ValidatorQueueView';
import { AutoCollisionReportView } from '../components/AutoCollisionReportView';

export const ValidatorModule: React.FC = () => {
  const activeNav = useClaimStore((state) => state.activeNav);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const claims = useClaimStore((state) => state.claims);

  const pendingCount = claims.filter((c) => c.status === 'pending').length;
  const approvedCount = claims.filter((c) => c.status === 'succeeded' || c.status === 'approved').length;

  return (
    <div className="w-full">
      {/* Route Views */}
      {activeNav === 'queue' && <ValidatorQueueView />}

      {activeNav === 'report' && <AutoCollisionReportView />}

      {activeNav === 'analytics' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 sm:p-8 max-w-5xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0f1c2b]">Motor Claims Compliance & Analytics</h2>
              <p className="text-xs text-[#64748b] mt-1">
                Real-time validation throughput, fraud detection metrics, and settlement turnaround times.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f1c2b] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Compliance Audit
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-[#eef4ff] rounded-xl border border-[#cde5fc]">
              <p className="text-xs text-[#4a6173] font-semibold">Active Claims in Queue</p>
              <p className="text-2xl font-bold text-[#00355f] mt-1">{pendingCount}</p>
              <span className="text-[11px] text-[#4a6173]">Requiring adjuster sign-off</span>
            </div>

            <div className="p-4 bg-[#ecfdf5] rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-800 font-semibold">Resolved Settlements</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{approvedCount}</p>
              <span className="text-[11px] text-emerald-700">100% policy match accuracy</span>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] font-semibold">Avg Turnaround Time</p>
              <p className="text-2xl font-bold text-[#0f1c2b] mt-1">1.8 Days</p>
              <span className="text-[11px] text-emerald-600 font-semibold">↓ 32% vs target SLA</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-900 font-semibold">AI Fraud Shield</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">99.4%</p>
              <span className="text-[11px] text-amber-800">0 duplicate claims detected</span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <h3 className="font-bold text-xs text-[#64748b] uppercase tracking-wider mb-3">
            Recent Validator Decision Logs
          </h3>
          <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                <tr>
                  <th className="p-3">Claim ID</th>
                  <th className="p-3">Adjuster</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Deductible Applied</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                <tr className="hover:bg-[#f8fafc]">
                  <td className="p-3 font-semibold text-[#00355f]">#CLM-2024-089</td>
                  <td className="p-3">Alex Vance</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                  <td className="p-3 font-mono font-medium">$500.00</td>
                  <td className="p-3 text-[#64748b]">Today, 10:14 AM</td>
                </tr>
                <tr className="hover:bg-[#f8fafc]">
                  <td className="p-3 font-semibold text-[#00355f]">#CLM-2024-042</td>
                  <td className="p-3">Alex Vance</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                  <td className="p-3 font-mono font-medium">$250.00</td>
                  <td className="p-3 text-[#64748b]">Yesterday, 04:30 PM</td>
                </tr>
                <tr className="hover:bg-[#f8fafc]">
                  <td className="p-3 font-semibold text-[#00355f]">#CLM-2024-031</td>
                  <td className="p-3">System Agent</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                      Rejected
                    </span>
                  </td>
                  <td className="p-3 font-mono font-medium">$0.00</td>
                  <td className="p-3 text-[#64748b]">Oct 21, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'settings' && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 sm:p-8 max-w-3xl shadow-xs">
          <h2 className="text-xl font-bold text-[#0f1c2b] mb-2">Validator Unit Configuration</h2>
          <p className="text-xs text-[#64748b] mb-6">
            Configure automated OCR extraction thresholds, deductible defaults, and split-screen preferences.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 border border-[#e2e8f0] rounded-xl">
              <div>
                <h4 className="font-bold text-[#0f1c2b]">Auto-Flag Suspicious Garage Estimates</h4>
                <p className="text-[#64748b] mt-0.5">
                  Highlight line-items exceeding regional standard parts labor rates by over 15%.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-emerald-800 bg-emerald-100 font-bold text-[11px]">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-[#e2e8f0] rounded-xl">
              <div>
                <h4 className="font-bold text-[#0f1c2b]">Default Standard Deductible</h4>
                <p className="text-[#64748b] mt-0.5">
                  Pre-populated baseline deductible for standard motor collision claims.
                </p>
              </div>
              <span className="font-mono font-bold text-sm text-[#00355f] bg-[#eef4ff] px-3 py-1 rounded-lg">
                $500.00
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-[#e2e8f0] rounded-xl">
              <div>
                <h4 className="font-bold text-[#0f1c2b]">High-Resolution Split Verification</h4>
                <p className="text-[#64748b] mt-0.5">
                  Enable side-by-side bill inspector with deep zoom and print capabilities.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-emerald-800 bg-emerald-100 font-bold text-[11px]">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorModule;

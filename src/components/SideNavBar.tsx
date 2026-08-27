import React from 'react';
import { useClaimStore } from '../store/useClaimStore';
import { UserRole } from '../types';

export const SideNavBar: React.FC = () => {
  const role = useClaimStore((state) => state.role);
  const currentUser = useClaimStore((state) => state.currentUser);
  const activeNav = useClaimStore((state) => state.activeNav);
  const setActiveNav = useClaimStore((state) => state.setActiveNav);
  const isMobileSidebarOpen = useClaimStore((state) => state.isMobileSidebarOpen);
  const setIsMobileSidebarOpen = useClaimStore((state) => state.setIsMobileSidebarOpen);
  const isSidebarCollapsed = useClaimStore((state) => state.isSidebarCollapsed);
  const toggleSidebarCollapsed = useClaimStore((state) => state.toggleSidebarCollapsed);
  const logout = useClaimStore((state) => state.logout);
  const setSelectedClaimForReportId = useClaimStore((state) => state.setSelectedClaimForReportId);

  const handleNavigate = (nav: string) => {
    setActiveNav(nav);
    setIsMobileSidebarOpen(false);
  };

  const handleProcessNewClaim = () => {
    setSelectedClaimForReportId(null);
    setActiveNav('report');
    setIsMobileSidebarOpen(false);
  };

  const handleNewUpload = () => {
    setActiveNav('upload');
    setIsMobileSidebarOpen(false);
  };

  const isCollapsed = isSidebarCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 bg-[#1e293b] text-[#cbd5e1] flex flex-col border-r border-[#334155] select-none transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header & Toggle Section */}
        <div
          className={`p-4 border-b border-white/10 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#00355f] flex items-center justify-center flex-shrink-0 border border-white/20">
                <span className="material-symbols-outlined text-white text-[18px]">
                  {role === 'claimer' ? 'person' : 'verified_user'}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white tracking-tight truncate">
                  {role === 'claimer' ? 'Claimer Portal' : 'Validator Hub'}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {role === 'claimer' ? 'Policyholder View' : 'Motor Claims Desk'}
                </p>
              </div>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebarCollapsed}
            className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
              isCollapsed ? 'w-10 h-10 items-center justify-center' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Action Button */}
        <div className={`p-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {role === 'validator' ? (
            <button
              onClick={handleProcessNewClaim}
              className={`bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 ${
                isCollapsed
                  ? 'w-11 h-11 p-0'
                  : 'w-full py-2.5 px-3 text-xs uppercase tracking-wider'
              }`}
              title="Process New Claim"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              {!isCollapsed && <span>Process Claim</span>}
            </button>
          ) : (
            <button
              onClick={handleNewUpload}
              className={`bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 ${
                isCollapsed
                  ? 'w-11 h-11 p-0'
                  : 'w-full py-2.5 px-3 text-xs uppercase tracking-wider'
              }`}
              title="Submit New Claim"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              {!isCollapsed && <span>New Claim</span>}
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1">
          {role === 'claimer' ? (
            /* CLAIMER NAV ITEMS */
            <>
              {/* Upload */}
              <button
                onClick={() => handleNavigate('upload')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'upload'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Multi-Document Upload"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'upload' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  upload_file
                </span>
                {!isCollapsed && <span className="truncate">Submit Documents</span>}
              </button>

              {/* Status & History */}
              <button
                onClick={() => handleNavigate('history')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'history'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Claim Status & Tracker"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'history' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  history_toggle_off
                </span>
                {!isCollapsed && <span className="truncate">Claim Tracker</span>}
              </button>

              {/* Notifications */}
              <button
                onClick={() => handleNavigate('notifications')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer relative ${
                  activeNav === 'notifications'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Claimer Notifications"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'notifications' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  notifications
                </span>
                {!isCollapsed && <span className="truncate">Alerts & Updates</span>}
                {isCollapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#1e293b]"></span>
                )}
              </button>

              {/* Support */}
              <button
                onClick={() => handleNavigate('support')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'support'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Help & Support Desk"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'support' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  help
                </span>
                {!isCollapsed && <span className="truncate">Support Center</span>}
              </button>
            </>
          ) : (
            /* VALIDATOR NAV ITEMS */
            <>
              {/* Queue */}
              <button
                onClick={() => handleNavigate('queue')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'queue'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Claims Queue"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'queue' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  assignment
                </span>
                {!isCollapsed && <span className="truncate">Claims Queue</span>}
              </button>

              {/* Verification Center */}
              <button
                onClick={() => handleNavigate('report')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'report'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Verification Center"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'report' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  fact_check
                </span>
                {!isCollapsed && <span className="truncate">Verification Center</span>}
              </button>

              {/* Reports & Analytics */}
              <button
                onClick={() => handleNavigate('analytics')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'analytics'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Reports & Audit Logs"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'analytics' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  analytics
                </span>
                {!isCollapsed && <span className="truncate">Audit & Analytics</span>}
              </button>

              {/* Settings */}
              <button
                onClick={() => handleNavigate('settings')}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer ${
                  activeNav === 'settings'
                    ? 'bg-[#cde5fc] text-[#0f1c2b] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-xs text-left'}`}
                title="Validator Settings"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeNav === 'settings' ? 'text-[#00355f] filled-icon' : 'text-slate-400'
                  }`}
                >
                  settings
                </span>
                {!isCollapsed && <span className="truncate">Unit Settings</span>}
              </button>
            </>
          )}
        </div>

        {/* User Profile & Logout Box inside Sidebar */}
        <div className="p-3 border-t border-white/10 bg-[#0f172a]/50">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-white/20"
                title={`${currentUser?.name} (${role})`}
              />
              <button
                onClick={logout}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Profile details */}
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-white/20 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {currentUser?.roleTitle}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-red-500/15 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Log Out of Portal"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

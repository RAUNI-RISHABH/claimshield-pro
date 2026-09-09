import React from 'react';
import { useClaimStore } from '../store/useClaimStore';

export const TopNavBar: React.FC = () => {
  const role = useClaimStore((state) => state.role);
  const activeNav = useClaimStore((state) => state.activeNav);
  const searchQuery = useClaimStore((state) => state.searchQuery);
  const setSearchQuery = useClaimStore((state) => state.setSearchQuery);
  const setIsNotificationsOpen = useClaimStore((state) => state.setNotificationsOpen);
  const setIsMobileSidebarOpen = useClaimStore((state) => state.setIsMobileSidebarOpen);
  const notifications = useClaimStore((state) => state.notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeViewTitle =
    role === 'claimer'
      ? activeNav === 'upload'
        ? 'Multi-Document Upload'
        : activeNav === 'history'
          ? 'Claim Status & Tracker'
          : activeNav === 'notifications'
            ? 'Alerts & Updates'
            : 'Support Center'
      : activeNav === 'queue'
        ? 'Claims Queue'
        : activeNav === 'report'
          ? 'Verification Center'
          : activeNav === 'analytics'
            ? 'Audit & Analytics'
            : 'Unit Settings';

  return (
    <header className="flex justify-between items-center px-4 md:px-6 w-full fixed top-0 z-50 bg-white h-16 border-b border-[#e2e8f0] shadow-xs">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileSidebarOpen((v) => !v)}
          className="md:hidden p-2 text-[#42474f] hover:bg-[#eef4ff] rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Brand Logo & View Tag */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00355f] to-[#4a6173] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-white text-[20px]">verified_user</span>
          </div>
          <span className="font-bold text-lg md:text-xl text-[#00355f] tracking-tight">
            ClaimIQ
          </span>
          {/* {activeViewTitle && (
            <span className="hidden sm:inline-block text-xs font-semibold text-[#00355f] bg-[#eef4ff] px-2.5 py-0.5 rounded-full border border-[#cde5fc]">
              {activeViewTitle}
            </span>
          )} */}
        </div>
      </div>

      {/* Middle search for Claims & Policies */}

      {/* Right Controls (Notifications & User Pill) */}
      <div className="flex items-center gap-3 text-[#4a6173]">
        {/* System Active Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{role === 'claimer' ? 'Claimer Session' : 'Validator Session'}</span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative hover:bg-[#eef4ff] text-[#4a6173] hover:text-[#00355f] transition-colors p-2 rounded-lg cursor-pointer"
          title="Notifications & Alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>
      </div>
    </header>
  );
};

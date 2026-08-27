import React, { Suspense } from 'react';
import { useClaimStore } from './store/useClaimStore';
import { LoginScreen } from './components/LoginScreen';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { SplitScreenVerificationModal } from './components/SplitScreenVerificationModal';
import { DownloadReportModal } from './components/DownloadReportModal';
import { NotificationModal } from './components/NotificationModal';
import { ResolutionDrawer } from './components/ResolutionDrawer';

// Lazy loaded modules as requested
const ClaimerModule = React.lazy(() => import('./modules/ClaimerModule'));
const ValidatorModule = React.lazy(() => import('./modules/ValidatorModule'));

// Fallback skeleton loader while lazy module is loading
const ModuleLoadingFallback: React.FC = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 border-3 border-[#00355f]/20 border-t-[#00355f] rounded-full animate-spin"></div>
    <div className="text-center">
      <p className="text-sm font-bold text-[#00355f]">Loading Portal Module...</p>
      <p className="text-xs text-[#64748b] mt-1">Configuring permissions and active workspace</p>
    </div>
  </div>
);

export default function App() {
  const isAuthenticated = useClaimStore((state) => state.isAuthenticated);
  const currentUser = useClaimStore((state) => state.currentUser);
  const role = useClaimStore((state) => state.role);
  const isSidebarCollapsed = useClaimStore((state) => state.isSidebarCollapsed);

  // If not logged in, display the dedicated Login Screen
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0f1c2b] min-h-screen flex flex-col antialiased selection:bg-[#cde5fc] selection:text-[#00355f]">
      {/* Top Fixed Navigation Bar */}
      <TopNavBar />

      <div className="flex pt-16 flex-1 h-full">
        {/* Left Navigation Sidebar with Toggle Collapse & Role Switcher */}
        <SideNavBar />

        {/* Main Content Area with Dynamic Margin based on Sidebar State */}
        <main
          className={`flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          <Suspense fallback={<ModuleLoadingFallback />}>
            {role === 'claimer' ? <ClaimerModule /> : <ValidatorModule />}
          </Suspense>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <SplitScreenVerificationModal />
      <DownloadReportModal />
      <NotificationModal />
      <ResolutionDrawer />
    </div>
  );
}

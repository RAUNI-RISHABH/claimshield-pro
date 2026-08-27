import React, { useState } from 'react';
import { useClaimStore, DEFAULT_CLAIMER_USER, DEFAULT_VALIDATOR_USER } from '../store/useClaimStore';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const login = useClaimStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('claimer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const activeUser = selectedRole === 'claimer' ? DEFAULT_CLAIMER_USER : DEFAULT_VALIDATOR_USER;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole, {
        email: email || activeUser.email,
        name: email ? email.split('@')[0] : activeUser.name,
      });
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      login(role);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1523] via-[#002244] to-[#0d2847] text-slate-100 flex flex-col justify-between antialiased selection:bg-[#4a6173] selection:text-white p-4 sm:p-6">
      {/* Top Brand Bar */}
      <header className="max-w-md w-full mx-auto pt-4 flex items-center justify-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00355f] to-[#4a6173] flex items-center justify-center shadow-lg border border-white/20">
          <span className="material-symbols-outlined text-white text-[24px]">verified_user</span>
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            ClaimShield <span className="text-sky-400 font-semibold">Pro</span>
          </h1>
          <p className="text-[11px] text-slate-300">Motor Claims Intelligence</p>
        </div>
      </header>

      {/* Main Centered Login Box */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 text-[#0f1c2b] p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#0f1c2b] tracking-tight">Portal Login</h2>
            <p className="text-xs text-[#64748b] mt-1">
              Select your account type or use one-click demo login
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f5f9] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('claimer');
                setEmail('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'claimer'
                  ? 'bg-white text-[#00355f] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f1c2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Policyholder
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('validator');
                setEmail('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'validator'
                  ? 'bg-white text-[#00355f] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f1c2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Validator
            </button>
          </div>

          {/* Quick Demo Login Option */}
          <div className="mb-6 p-4 rounded-xl border border-sky-100 bg-[#f8faff]">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#0f1c2b] truncate">{activeUser.name}</p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wide">
                    Demo {selectedRole}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b] truncate">
                  {selectedRole === 'claimer' ? activeUser.policyNumber : activeUser.roleTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(selectedRole)}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#00355f] hover:bg-[#0f4c81] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Quick Demo Login</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-[#e2e8f0] w-full"></div>
            <span className="bg-white px-3 text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider">
              or enter credentials
            </span>
          </div>

          {/* Credential Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94a3b8]">
                  mail
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeUser.email}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#cbd5e1] rounded-lg text-xs font-medium focus:border-[#00355f] focus:ring-1 focus:ring-[#00355f] outline-none text-[#0f1c2b] bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#334155]">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-[11px] font-semibold text-[#00355f] hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94a3b8]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#cbd5e1] rounded-lg text-xs font-medium focus:border-[#00355f] focus:ring-1 focus:ring-[#00355f] outline-none text-[#0f1c2b] bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#00355f] rounded border-[#cbd5e1] focus:ring-[#00355f] cursor-pointer"
                />
                <span className="text-xs text-[#475569]">Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f1c2b] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#cbd5e1] cursor-pointer active:scale-98"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-3">
        ClaimShield Pro Enterprise Motor Claims
      </footer>
    </div>
  );
};

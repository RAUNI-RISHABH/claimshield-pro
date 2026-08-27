import React from 'react';
import { useClaimStore } from '../store/useClaimStore';

export const NotificationModal: React.FC = () => {
  const isOpen = useClaimStore((state) => state.isNotificationsOpen);
  const setOpen = useClaimStore((state) => state.setNotificationsOpen);
  const notifications = useClaimStore((state) => state.notifications);
  const markAllAsRead = useClaimStore((state) => state.markAllNotificationsRead);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1c2b]/40 backdrop-blur-xs flex items-start justify-end p-4 md:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-[#e2e8f0] overflow-hidden mt-14 mr-2 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00355f] text-[20px]">notifications</span>
            <h3 className="text-sm font-bold text-[#0f1c2b]">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-[#4a6173] hover:text-[#00355f] font-semibold hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-[#64748b] hover:text-[#0f1c2b] p-1 rounded hover:bg-slate-200/50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#e2e8f0] overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 hover:bg-[#f8fafc] transition-colors ${
                !item.read ? 'bg-[#eef4ff]/50' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    item.type === 'success'
                      ? 'text-[#10b981]'
                      : item.type === 'warning'
                      ? 'text-[#f59e0b]'
                      : 'text-[#00355f]'
                  }`}
                >
                  {item.type === 'success'
                    ? 'check_circle'
                    : item.type === 'warning'
                    ? 'warning'
                    : 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-[#0f1c2b]">{item.title}</p>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#00355f] ml-1 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#42474f] mt-1 leading-relaxed">{item.desc}</p>
                  <p className="text-[10px] text-[#727780] mt-1.5">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

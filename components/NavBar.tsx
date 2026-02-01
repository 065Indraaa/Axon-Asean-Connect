import React from 'react';
import { Home, Zap, ScanLine, WalletCards, Settings } from 'lucide-react';
import { AppView } from '../types';

interface NavBarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Home' },
    { view: AppView.AXON_SNAP, icon: Zap, label: 'Snap' },
    { view: AppView.SCAN, icon: ScanLine, label: 'Scan', isPrimary: true },
    { view: AppView.HISTORY, icon: WalletCards, label: 'Activity' },
    { view: AppView.SETTINGS, icon: Settings, label: 'Config' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-[#262626] pt-2 pb-safe px-4 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          
          if (item.isPrimary) {
             return (
               <button
                key={item.label}
                onClick={() => onChangeView(item.view)}
                className="relative -top-4 active:scale-95 transition-transform"
               >
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] active:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                   <Icon className="w-6 h-6 text-black" />
                 </div>
               </button>
             );
          }

          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center gap-1 transition-all active:scale-95 p-2 rounded-lg ${isActive ? 'text-white bg-white/5' : 'text-neutral-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
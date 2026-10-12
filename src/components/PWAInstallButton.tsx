import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallAppModal, InstallModalTab } from './InstallAppModal';

// Google Play Icon SVG
const GooglePlayIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.609 1.814C3.25 2.19 3 2.76 3 3.498v17.004c0 .738.25 1.308.609 1.684l.088.084 9.537-9.538v-.464L3.697 1.73l-.088.084z"
      fill="#2196F3"
    />
    <path
      d="M16.417 15.867l-3.183-3.183v-.464l3.183-3.183.072.042 3.774 2.144c1.077.612 1.077 1.614 0 2.226l-3.774 2.144-.072.042-.001-.767z"
      fill="#FFC107"
    />
    <path
      d="M16.489 15.825L13.234 12.22 3.609 21.844c.355.378.948.423 1.623.039l11.257-6.058z"
      fill="#F44336"
    />
    <path
      d="M16.489 8.175L5.232 2.117C4.557 1.733 3.964 1.778 3.609 2.156L13.234 11.78l3.255-3.605z"
      fill="#4CAF50"
    />
  </svg>
);

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<InstallModalTab>('playstore');

  const handleOpenPlayStore = () => {
    setModalTab('playstore');
    setIsModalOpen(true);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setModalTab('pwa');
        setIsModalOpen(true);
      }
    } else {
      setModalTab(isInstalled ? 'playstore' : 'pwa');
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Play Store Public Publishing Button */}
        <button
          onClick={handleOpenPlayStore}
          title="Google Play Store Distribution (TWA, Package & Guide)"
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer bg-stone-900 hover:bg-stone-800 text-stone-200 border-stone-700 hover:border-emerald-500/50 shadow-sm"
        >
          <GooglePlayIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Play Store</span>
          <span className="sm:hidden text-[11px]">Play</span>
        </button>

        {/* PWA Direct Install Button */}
        <button
          onClick={handleInstallClick}
          title={
            isInstalled
              ? 'App installed in standalone mode'
              : 'Install [BOR] Smart Fridge on device'
          }
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            isInstalled
              ? 'bg-stone-800 hover:bg-stone-750 text-emerald-400 border-emerald-500/30'
              : isInstallable
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 shadow-md shadow-emerald-950/40 animate-pulse'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 hover:border-emerald-500/50'
          }`}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Installed</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Install</span>
              <span className="sm:hidden">Get</span>
            </>
          )}
        </button>
      </div>

      <InstallAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
};

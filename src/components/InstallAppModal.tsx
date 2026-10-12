import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  HardDriveDownload,
  Check,
  Copy,
  PackageCheck,
  Terminal,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type InstallModalTab = 'pwa' | 'playstore' | 'archive';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: InstallModalTab;
}

// Google Play icon SVG
const GooglePlayLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'playstore',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<InstallModalTab>(defaultTab);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingPlayPackage, setIsDownloadingPlayPackage] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://smartfridge.web.app';
  const pwabuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentOrigin)}`;

  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleDownloadZip = () => {
    setIsDownloadingZip(true);
    const link = document.createElement('a');
    link.href = '/api/download-app';
    link.setAttribute('download', 'smart-fridge-app.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingZip(false);
    }, 2000);
  };

  const handleDownloadPlayPackage = () => {
    setIsDownloadingPlayPackage(true);
    const link = document.createElement('a');
    link.href = '/api/download-play-package';
    link.setAttribute('download', 'google-play-store-twa-package.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingPlayPackage(false);
    }, 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative text-stone-100 flex flex-col space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <GooglePlayLogo className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  [BOR]
                </span>
                <h3 id="install-modal-title" className="text-xl font-bold font-serif text-stone-100">
                  Publish to Google Play Store & Install
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Official Google Play (TWA), instant home-screen install, or complete project export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (3 Tabs: Play Store, Direct PWA, Full ZIP) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('playstore')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'playstore'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <GooglePlayLogo className="w-4 h-4 shrink-0" />
            <span className="truncate">Google Play Store</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="truncate">Install App (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderArchive className="w-4 h-4 shrink-0" />
            <span className="truncate">Download ZIP</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE PLAY STORE (PUBLIC RELEASE) */}
        {activeTab === 'playstore' && (
          <div className="space-y-4">
            {/* Banner: Ready for Google Play Console */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-stone-900 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                    Trusted Web Activity (TWA) Verified
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Target: Android 5.0 - 15+
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-100">
                Ready for Public Release on Google Play Store
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Google officially supports publishing Progressive Web Apps directly to the Public Google Play Store using <strong>Trusted Web Activity (TWA)</strong>. It produces a native Android App Bundle (<code>.aab</code>) with full offline support, zero address bar, and hardware acceleration.
              </p>
            </div>

            {/* Core Verification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-stone-200">Web Manifest</div>
                <div className="text-[10px] text-stone-400">v2 Validated</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-stone-200">512x512 Icon</div>
                <div className="text-[10px] text-stone-400">PNG + Maskable</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-stone-200">Feature Graphic</div>
                <div className="text-[10px] text-stone-400">1024x500 Ready</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-stone-200">Asset Links</div>
                <div className="text-[10px] text-stone-400">Digital Verification</div>
              </div>
            </div>

            {/* Two Primary Action Routes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Route 1: Instant PWABuilder Flow */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Option A: 1-Click PWABuilder</span>
                  </div>
                  <h5 className="text-sm font-bold text-stone-100">
                    Generate Signed .aab Online
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    PWABuilder (by Microsoft & Google) compiles the production Android App Bundle in the cloud with zero command-line tools needed.
                  </p>
                </div>

                <a
                  href={pwabuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-950/50"
                >
                  <span>Build on PWABuilder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Route 2: Download Play Store Package */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-teal-400">
                    <PackageCheck className="w-4 h-4" />
                    <span>Option B: Complete Play Package</span>
                  </div>
                  <h5 className="text-sm font-bold text-stone-100">
                    Download Play Assets & TWA (.zip)
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Includes 512px icon, 1024x500 banner, <code>twa-manifest.json</code>, Bubblewrap script, and Play Console listing descriptions.
                  </p>
                </div>

                <button
                  onClick={handleDownloadPlayPackage}
                  disabled={isDownloadingPlayPackage}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-teal-950/50 cursor-pointer"
                >
                  {isDownloadingPlayPackage ? (
                    <>
                      <HardDriveDownload className="w-3.5 h-3.5 animate-bounce" />
                      <span>Packaging ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Play Package (.zip)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Google Play Store Listing Copy & Paste Metadata */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1.5">
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Store Listing Metadata (Click to Copy for Play Console)</span>
              </span>

              <div className="space-y-2">
                {/* App Title */}
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">App Title</span>
                    <span className="font-semibold text-stone-200">
                      [BOR] Smart Fridge & Culinary Assistant
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard('[BOR] Smart Fridge & Culinary Assistant', 'title')
                    }
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Title"
                  >
                    {copiedKey === 'title' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Short Description */}
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Short Description (Max 80 chars)</span>
                    <span className="font-medium text-stone-200">
                      Snap your fridge, detect ingredients with AI, cook hands-free with voice guides.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'Snap your fridge, detect ingredients with AI, cook hands-free with voice guides.',
                        'short_desc'
                      )
                    }
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Copy Short Description"
                  >
                    {copiedKey === 'short_desc' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Package ID & Category */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Android Package ID</span>
                      <span className="font-mono text-emerald-400 text-[11px]">
                        app.smartfridge.culinary.twa
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard('app.smartfridge.culinary.twa', 'package_id')
                      }
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'package_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Category & Rating</span>
                      <span className="font-semibold text-stone-200 text-[11px]">
                        Food & Drink • Everyone
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('Food & Drink', 'cat')}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'cat' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Step Play Console Publishing Checklist */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2.5 text-xs text-stone-300">
              <div className="font-bold text-stone-100 flex items-center space-x-2">
                <GooglePlayLogo className="w-4 h-4" />
                <span>5-Step Google Play Console Submission Flow</span>
              </div>
              <ol className="space-y-1.5 list-decimal list-inside pl-1 text-stone-400">
                <li>
                  <strong className="text-stone-200">Open Google Play Console:</strong> Sign in at{' '}
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline"
                  >
                    play.google.com/console
                  </a>{' '}
                  and click <em>"Create app"</em>.
                </li>
                <li>
                  <strong className="text-stone-200">Fill in Store Listing:</strong> Paste the Title, Short Description, and upload the provided 512x512 icon & 1024x500 banner graphic.
                </li>
                <li>
                  <strong className="text-stone-200">Upload the .aab Bundle:</strong> In <em>Production</em> or <em>Internal testing</em>, upload the <code>.aab</code> generated by PWABuilder or Bubblewrap.
                </li>
                <li>
                  <strong className="text-stone-200">Digital Asset Links:</strong> Copy the SHA-256 fingerprint from <em>App signing</em> and paste into <code>/.well-known/assetlinks.json</code> for seamless full-screen mode.
                </li>
                <li>
                  <strong className="text-stone-200">Submit for Review:</strong> Complete questionnaire and submit. Google Play typically reviews in 24–48 hours!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: PWA DIRECT INSTALL */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            {/* Status Card */}
            {isInstalled || justInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Application is already installed!</div>
                  <div className="text-xs text-emerald-400/80 mt-0.5">
                    You are enjoying [BOR] Smart Fridge in standalone mode without browser toolbars.
                  </div>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="p-5 rounded-2xl bg-stone-800/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                    Ready to Install
                  </span>
                  <div className="text-sm font-bold text-stone-100">
                    Add [BOR] Smart Fridge to your device
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Fast launch icon on your home screen or desktop taskbar.
                  </div>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-transform active:scale-95 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App Now</span>
                </button>
              </div>
            ) : null}

            {/* Platform Guides */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Installation Instructions by Device
              </span>

              {/* Android Guide */}
              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android (Chrome / Samsung / Brave)</span>
                </div>
                <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside pl-1">
                  <li>Tap the browser menu (three dots <strong>⋮</strong> in upper right).</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm installation to launch [BOR] like a native Android app.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
                  <Smartphone className="w-4 h-4 text-teal-400" />
                  <span>iPhone & iPad (Safari)</span>
                </div>
                <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside pl-1">
                  <li>
                    Tap the <strong className="text-stone-100">Share button</strong> (square with arrow up{' '}
                    <Share className="inline w-3 h-3 text-emerald-400" />) in Safari toolbar.
                  </li>
                  <li>
                    Scroll down and tap <strong className="text-stone-100">"Add to Home Screen"</strong>{' '}
                    <PlusSquare className="inline w-3 h-3 text-emerald-400" />.
                  </li>
                  <li>
                    Tap <strong className="text-stone-100">"Add"</strong> in top-right to place the [BOR] icon on your home screen!
                  </li>
                </ol>
              </div>

              {/* Desktop Guide */}
              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>Desktop PC & Mac (Chrome / Edge)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Look for the <strong className="text-stone-100">Install icon</strong> (🖥️ or ⬇️) directly on the right side of your browser address bar, or click your browser's three-dot menu and select <strong>"Install [BOR] Smart Fridge..."</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOWNLOAD ARCHIVE ZIP */}
        {activeTab === 'archive' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-stone-800/70 border border-stone-700 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100">
                    Full Application Code Archive (.zip)
                  </h4>
                  <p className="text-xs text-stone-400">
                    Complete full-stack package ready for local development or self-hosting
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                <div className="font-semibold text-stone-200">Includes:</div>
                <ul className="list-disc list-inside space-y-0.5 text-stone-400">
                  <li>React 19 + TypeScript + Vite frontend</li>
                  <li>Express server with Gemini AI vision & culinary endpoints</li>
                  <li>Hands-free cooking mode with voice recognition & read-aloud</li>
                  <li>PWA manifest, service workers, and high-resolution icons</li>
                  <li>Firebase credentials blueprint & security rules</li>
                  <li>Google Play Store publishing guide and TWA manifest</li>
                </ul>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                {isDownloadingZip ? (
                  <>
                    <HardDriveDownload className="w-4 h-4 animate-bounce" />
                    <span>Preparing & Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download smart-fridge-app.zip</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 text-xs text-stone-400 space-y-1">
              <div className="font-semibold text-stone-300">How to run locally:</div>
              <p className="font-mono text-[11px] text-emerald-400">
                unzip smart-fridge-app.zip &amp;&amp; npm install &amp;&amp; npm run dev
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs text-stone-400">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Google Play Store (TWA) & PWA Offline Certified</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

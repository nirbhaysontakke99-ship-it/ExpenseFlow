import React from 'react';

export interface ViewContainerProps {
  children: React.ReactNode;
  isMobileFrameMode: boolean;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  children,
  isMobileFrameMode,
}) => {
  if (!isMobileFrameMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/95 dark:bg-slate-950 py-6 px-4 flex flex-col items-center justify-center font-sans transition-colors duration-200">
      {/* Mobile Device Mock Shell */}
      <div className="relative w-full max-w-[410px] h-[840px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Top Speaker Notch & Camera Pill */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-2">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
        </div>

        {/* Side Hardware Buttons */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-[7px] top-36 w-[3px] h-16 bg-slate-700 rounded-r-md" />

        {/* Screen Content Window */}
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[38px] overflow-y-auto flex flex-col relative pt-4 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-[100dvh] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden w-full">
    <div className="starfield" />
    {/* Subtle orbital lines */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 orbital-ring">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square border border-white/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] aspect-square border border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] aspect-square border border-white/10 rounded-full" />
    </div>
    <div className="max-w-md w-full mx-auto min-h-[100dvh] flex flex-col p-4 sm:p-8 relative z-10">
      {children}
    </div>
  </div>
);

export default Layout;

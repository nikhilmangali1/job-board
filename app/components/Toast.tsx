"use client";

export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

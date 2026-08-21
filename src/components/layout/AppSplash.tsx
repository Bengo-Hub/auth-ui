// Branded full-screen loading state shown while auth/session data is being resolved.
// Replaces a bare spinner-on-blank-page so there's no jarring flash between the OS-level
// PWA splash (iOS's startupImage, Android's manifest background_color) and real content —
// same logo mark, same brand color, just rendered by the app itself instead of the OS.
export function AppSplash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-2xl animate-pulse" />
        <img
          src="/svgs/logo.svg"
          alt=""
          className="relative w-16 h-16 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500"
        />
      </div>
      <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}

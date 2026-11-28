export default function Logo({ size = 40, text = true, light = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="24 24 112 112" aria-hidden="true">
        <defs>
          <linearGradient id="sq-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1E3A8A" />
            <stop offset="1" stopColor="#0D9488" />
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="112" height="112" rx="28" fill="url(#sq-grad)" />
        <circle cx="78" cy="76" r="30" fill="none" stroke="#fff" strokeWidth="9" />
        <path d="M64 76 L74 86 L93 62" fill="none" stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M98 100 L112 114" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      </svg>
      {text && (
        <span className="text-2xl font-extrabold tracking-tight">
          <span className={light ? "text-white" : "text-brand-navy"}>Sahi</span>
          <span className="text-brand-teal">Sewa</span>
          <span className="text-brand-saffron">Q</span>
        </span>
      )}
    </span>
  );
}
import { Link, Navigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { todayIST, formatDate } from "../utils/date.js";

const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem("sq_last_token"));
  } catch {
    return null;
  }
};

export default function TokenSuccess() {
  const { state } = useLocation();
  const t = state || readSaved(); // survives a page refresh

  if (!t) return <Navigate to="/book" replace />;

  const isToday = t.date === todayIST();
  const q = t.queue;
  const trackPath = `/track?tokenNo=${encodeURIComponent(t.tokenNo)}&date=${t.date}`;
  const trackUrl = `${window.location.origin}${trackPath}`;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="mb-4 text-center text-sm font-medium text-brand-teal">✓ Your token is booked</p>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-brand-navy to-brand-teal px-6 py-8 text-center text-white">
          <p className="text-sm uppercase tracking-widest text-white/80">Token number</p>
          <p className="mt-1 text-6xl font-extrabold tracking-wide">{t.tokenNo}</p>
          <p className="mt-3 font-medium">{t.serviceName}</p>
          <p className="text-sm text-white/80">{t.officeName}</p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 text-center">
          <div className="p-4">
            <p className="text-xs text-slate-500">Date</p>
            <p className="mt-1 font-semibold">{formatDate(t.date)}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500">Position</p>
            <p className="mt-1 font-semibold">{isToday && q?.position ? `#${q.position}` : "-"}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500">Est. wait</p>
            <p className="mt-1 font-semibold">
              {isToday && q?.estimatedWaitMin !== null && q?.estimatedWaitMin !== undefined
                ? q.estimatedWaitMin === 0 ? "You're next" : `~${q.estimatedWaitMin} min`
                : "-"}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 text-center">
          {!isToday && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Visit on {formatDate(t.date)}. Position and wait time appear on the day.
            </p>
          )}
          {isToday && q?.counterAssumed && (
            <p className="mb-4 text-xs text-slate-500">
              No counter is open yet, so this estimate assumes one counter.
            </p>
          )}

          <div className="mx-auto inline-block rounded-xl border border-slate-200 p-3">
            <QRCodeSVG value={trackUrl} size={150} level="M" />
          </div>
          <p className="mt-2 text-xs text-slate-500">Scan to open your live status on your phone</p>

          <p className="mt-4 text-sm text-slate-600">
            Booked for <span className="font-semibold">{t.citizenName}</span> · {t.mobile}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 p-4 sm:flex-row print:hidden">
          <Link to={trackPath} className="flex-1 rounded-lg bg-brand-navy py-2.5 text-center font-semibold text-white hover:bg-brand-navy/90">
            Track live
          </Link>
          <button onClick={() => window.print()} className="flex-1 rounded-lg border border-slate-300 py-2.5 font-medium hover:bg-slate-100">
            Print / Save
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm print:hidden">
        <Link to="/book" className="font-medium text-brand-navy underline">Book another token</Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-500 print:hidden">
        Keep your mobile number handy. You need it to track, cancel or reschedule.
      </p>
    </div>
  );
}
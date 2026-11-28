export default function Stepper({ steps, current }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 text-sm">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
                done
                  ? "bg-brand-teal text-white"
                  : active
                  ? "bg-brand-navy text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "font-semibold text-brand-navy" : "text-slate-500"}>
              {label}
            </span>
            {n < steps.length && <span className="mx-1 h-px w-8 bg-slate-300" />}
          </li>
        );
      })}
    </ol>
  );
}
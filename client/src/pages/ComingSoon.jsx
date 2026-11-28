export default function ComingSoon({ title, day }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-brand-navy">{title}</h1>
      <p className="mt-3 text-slate-600">This page is being built on Day {day}.</p>
    </div>
  );
}
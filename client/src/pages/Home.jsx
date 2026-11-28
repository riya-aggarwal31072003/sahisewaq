import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const steps = [
  { n: "1", title: "Choose a service", text: "Select your office and the service you need." },
  { n: "2", title: "Get your token", text: "Receive a token number and an estimated wait instantly." },
  { n: "3", title: "Track live", text: "Watch your position change in real time, from home." },
  { n: "4", title: "Visit when it's near", text: "Get notified and reach the office just in time." },
];

const features = [
  { title: "Real-time queue", text: "Positions update live, with no page refresh." },
  { title: "Wait-time estimate", text: "Based on how fast counters are actually serving." },
  { title: "Priority service", text: "Senior citizens and people with disabilities go first." },
  { title: "Easy rescheduling", text: "Cancel or move your token to another day." },
];

export default function Home() {
  const [offices, setOffices] = useState(null);

  useEffect(() => {
    api
      .get("/offices")
      .then((res) => setOffices(res.data.count))
      .catch(() => setOffices(null));
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          {offices !== null && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-green-300" />
              {offices} office{offices === 1 ? "" : "s"} connected live
            </span>
          )}
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Skip the line.<br />
            Get <span className="text-brand-saffron">the right service</span> on time.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">
            Book a token for any government service online, watch the queue live, and arrive
            only when it's your turn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/book" className="rounded-xl bg-brand-saffron px-6 py-3 font-semibold text-slate-900 shadow hover:brightness-95">
              Book a token
            </Link>
            <Link to="/track" className="rounded-xl border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10">
              Track my token
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-brand-navy">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy">Why SahiSewaQ</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border-l-4 border-brand-saffron bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
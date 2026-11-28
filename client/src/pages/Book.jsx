import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios.js";
import Stepper from "../components/Stepper.jsx";
import { todayIST, nowHHMM, formatDate } from "../utils/date.js";

const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30";

export default function Book() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [offices, setOffices] = useState([]);
  const [officeId, setOfficeId] = useState("");
  const [services, setServices] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ citizenName: "", mobile: "", email: "", date: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load offices (auto-select when there is only one)
  useEffect(() => {
    api
      .get("/offices")
      .then((res) => {
        setOffices(res.data.data);
        if (res.data.data.length === 1) setOfficeId(res.data.data[0]._id);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Load services (and their live queue info) when the office changes
  useEffect(() => {
    if (!officeId) return;
    setService(null);
    setServices([]);
    setSummaries({});
    api
      .get("/services", { params: { officeId } })
      .then(async (res) => {
        const list = res.data.data;
        setServices(list);
        const results = await Promise.allSettled(list.map((s) => api.get(`/queue/service/${s._id}`)));
        const map = {};
        results.forEach((r, i) => {
          if (r.status === "fulfilled") map[list[i]._id] = r.value.data.data;
        });
        setSummaries(map);
      })
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [officeId]);

  const office = offices.find((o) => o._id === officeId);

  // Today plus 7 days; today is disabled once the service has closed
  const dateOptions = useMemo(() => {
    if (!service) return [];
    const closedToday = nowHHMM() >= service.closeTime;
    return Array.from({ length: 8 }, (_, i) => {
      const value = todayIST(i);
      const name = i === 0 ? "Today" : i === 1 ? "Tomorrow" : "";
      return {
        value,
        label: `${name ? name + ", " : ""}${formatDate(value)}${i === 0 && closedToday ? " (closed)" : ""}`,
        disabled: i === 0 && closedToday,
      };
    });
  }, [service]);

  const chooseService = (s) => {
    setService(s);
    const closedToday = nowHHMM() >= s.closeTime;
    setForm((f) => ({ ...f, date: closedToday ? todayIST(1) : todayIST() }));
  };

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (form.citizenName.trim().length < 2) e.citizenName = "Please enter your full name";
    if (!MOBILE_RE.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (form.email && !EMAIL_RE.test(form.email)) e.email = "Enter a valid email or leave it blank";
    if (!form.date) e.date = "Choose a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const body = {
        serviceId: service._id,
        citizenName: form.citizenName.trim(),
        mobile: form.mobile,
        date: form.date,
      };
      if (form.email) body.email = form.email.trim();

      const { data } = await api.post("/tokens", body);
      const saved = {
        tokenNo: data.data.tokenNo,
        date: data.data.date,
        mobile: data.data.mobile,
        citizenName: data.data.citizenName,
        serviceName: service.name,
        department: service.department,
        officeName: office?.name || "",
        queue: data.queue,
      };
      localStorage.setItem("sq_last_token", JSON.stringify(saved));
      navigate("/token", { state: saved });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold text-brand-navy">Book a token</h1>
      <p className="mb-8 mt-1 text-center text-slate-600">Two quick steps. No login needed.</p>

      <Stepper steps={["Choose service", "Your details"]} current={step} />

      {loadError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      )}

      {step === 1 && (
        <section>
          <label htmlFor="office" className="mb-1 block text-sm font-medium">Office</label>
          <select
            id="office" value={officeId} className={inputClass}
            onChange={(e) => setOfficeId(e.target.value)}
          >
            <option value="">Select an office</option>
            {offices.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}{o.city ? `, ${o.city}` : ""}
              </option>
            ))}
          </select>

          {officeId && (
            <>
              <h2 className="mb-3 mt-6 font-semibold">Select a service</h2>
              {services.length === 0 ? (
                <p className="text-sm text-slate-500">No services available at this office yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => {
                    const sum = summaries[s._id];
                    const selected = service?._id === s._id;
                    return (
                      <button
                        type="button" key={s._id} onClick={() => chooseService(s)}
                        aria-pressed={selected}
                        className={`rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:shadow ${
                          selected ? "border-brand-teal ring-2 ring-brand-teal/20" : "border-slate-200"
                        }`}
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-teal">{s.department}</p>
                        <p className="mt-1 font-semibold">{s.name}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Open {s.openTime} to {s.closeTime} · about {s.avgDurationMin} min each
                        </p>
                        {sum && (
                          <p className="mt-2 text-sm text-slate-700">
                            <span className="font-semibold text-brand-navy">{sum.waiting}</span> waiting now
                            {sum.waiting > 0 && <> · about {sum.estimatedWaitForNewTokenMin} min wait</>}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button" disabled={!service} onClick={() => setStep(2)}
              className="rounded-lg bg-brand-navy px-6 py-2.5 font-semibold text-white hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && service && (
        <form onSubmit={submit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-teal">{service.department}</p>
              <p className="font-semibold">{service.name}</p>
              <p className="text-xs text-slate-500">{office?.name}</p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-brand-navy underline">
              Change
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
              <input
                id="name" value={form.citizenName} className={inputClass} autoComplete="name"
                onChange={(e) => setField("citizenName", e.target.value)}
                aria-invalid={!!errors.citizenName}
              />
              {errors.citizenName && <p className="mt-1 text-sm text-red-600">{errors.citizenName}</p>}
            </div>

            <div>
              <label htmlFor="mobile" className="mb-1 block text-sm font-medium">Mobile number</label>
              <input
                id="mobile" value={form.mobile} className={inputClass}
                inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit number"
                onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, ""))}
                aria-invalid={!!errors.mobile}
              />
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email <span className="font-normal text-slate-500">(optional, for updates)</span>
              </label>
              <input
                id="email" type="email" value={form.email} className={inputClass} autoComplete="email"
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium">Visit date</label>
              <select
                id="date" value={form.date} className={inputClass}
                onChange={(e) => setField("date", e.target.value)}
              >
                {dateOptions.map((d) => (
                  <option key={d.value} value={d.value} disabled={d.disabled}>{d.label}</option>
                ))}
              </select>
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
          </div>

          {apiError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium hover:bg-slate-100">
              Back
            </button>
            <button
              type="submit" disabled={busy}
              className="rounded-lg bg-brand-saffron px-6 py-2.5 font-semibold text-slate-900 hover:brightness-95 disabled:opacity-60"
            >
              {busy ? "Booking..." : "Get my token"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
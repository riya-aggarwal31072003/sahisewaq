const IST = "Asia/Kolkata";

// "YYYY-MM-DD" in IST, optionally N days ahead
export const todayIST = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(
    new Date(Date.now() + offsetDays * 86400000)
  );

// "HH:MM" in IST
export const nowHHMM = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

export const isValidDate = (s) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s));
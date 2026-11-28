const IST = "Asia/Kolkata";

// "YYYY-MM-DD" in IST, optionally N days ahead
export const todayIST = (offset = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(
    new Date(Date.now() + offset * 86400000)
  );

// "HH:MM" in IST
export const nowHHMM = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

// "Sat, 28 Nov"
export const formatDate = (ymd) =>
  new Date(`${ymd}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
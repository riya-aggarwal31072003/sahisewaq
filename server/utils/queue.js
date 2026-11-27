import Token from "../models/Token.js";
import Counter from "../models/Counter.js";
import Service from "../models/Service.js";

const SAMPLE_SIZE = 20;
const MIN_SAMPLES = 3;

// Average minutes per token: real data when available, else the admin's estimate
export const getAvgDuration = async (service) => {
  const done = await Token.find({
    serviceId: service._id,
    status: "completed",
    calledAt: { $ne: null },
    completedAt: { $ne: null },
  })
    .sort("-completedAt")
    .limit(SAMPLE_SIZE)
    .select("calledAt completedAt");

  // Cap each sample so one forgotten "in progress" token can't ruin the average
  const cap = service.avgDurationMin * 4;
  const mins = done
    .map((t) => Math.min((t.completedAt - t.calledAt) / 60000, cap))
    .filter((m) => m > 0);

  if (mins.length < MIN_SAMPLES) return service.avgDurationMin;
  const avg = mins.reduce((a, b) => a + b, 0) / mins.length;
  return Math.max(1, Math.round(avg * 10) / 10);
};

export const getStats = async (service) => {
  const [avg, openCounters] = await Promise.all([
    getAvgDuration(service),
    Counter.countDocuments({ serviceIds: service._id, status: "open" }),
  ]);
  return { avg, openCounters, counters: Math.max(1, openCounters) };
};

export const estimateWait = (ahead, { avg, counters }) =>
  Math.ceil((ahead * avg) / counters);

export const getNowServing = (base) =>
  Token.find({ ...base, status: "in-progress" })
    .select("tokenNo counterId")
    .populate("counterId", "name");

// Everything a citizen needs to see about one token
export const getQueueInfo = async (token) => {
  const service = await Service.findById(token.serviceId);
  const base = { serviceId: token.serviceId, date: token.date };
  const [stats, nowServing] = await Promise.all([getStats(service), getNowServing(base)]);

  let ahead = 0;
  let position = null;
  let estimatedWaitMin = null;

  if (token.status === "waiting") {
    ahead = await Token.countDocuments({
      ...base,
      status: "waiting",
      _id: { $ne: token._id },
      $or: token.priority
        ? [{ priority: true, seq: { $lt: token.seq } }]
        : [{ priority: true }, { priority: false, seq: { $lt: token.seq } }],
    });
    position = ahead + 1;
    estimatedWaitMin = estimateWait(ahead, stats);
  }

  return {
    status: token.status,
    position,
    ahead,
    estimatedWaitMin,
    avgServiceMin: stats.avg,
    activeCounters: stats.openCounters,
    counterAssumed: stats.openCounters === 0,
    counterId: token.counterId,
    nowServing,
  };
};

// Overview of one service's queue for one date
export const getServiceQueue = async (service, date) => {
  const base = { serviceId: service._id, date };
  const [stats, waiting, completed, nowServing] = await Promise.all([
    getStats(service),
    Token.countDocuments({ ...base, status: "waiting" }),
    Token.countDocuments({ ...base, status: "completed" }),
    getNowServing(base),
  ]);

  return {
    service: { _id: service._id, name: service.name, department: service.department },
    date,
    waiting,
    completed,
    nowServing,
    activeCounters: stats.openCounters,
    counterAssumed: stats.openCounters === 0,
    avgServiceMin: stats.avg,
    estimatedWaitForNewTokenMin: estimateWait(waiting, stats),
  };
};
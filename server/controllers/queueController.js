import Service from "../models/Service.js";
import Token from "../models/Token.js";
import { getQueueInfo, getServiceQueue, getStats, estimateWait } from "../utils/queue.js";
import { todayIST, isValidDate } from "../utils/time.js";

const fail = (res, code, msg) => {
  res.status(code);
  throw new Error(msg);
};

const getDate = (req, res) => {
  const date = req.query.date || todayIST();
  if (!isValidDate(date)) fail(res, 400, "Date must be in YYYY-MM-DD format");
  return date;
};

// GET /api/queue/status?tokenNo=I-003&mobile=9876543210&date=YYYY-MM-DD
export const tokenStatus = async (req, res, next) => {
  try {
    const { tokenNo, mobile } = req.query;
    const date = getDate(req, res);
    if (!tokenNo || !mobile) fail(res, 400, "tokenNo and mobile are required");

    const token = await Token.findOne({ tokenNo: tokenNo.toUpperCase(), mobile, date });
    if (!token) fail(res, 404, "Token not found");

    res.json({ success: true, tokenNo: token.tokenNo, date, queue: await getQueueInfo(token) });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/service/:serviceId?date=YYYY-MM-DD   (public)
export const serviceSummary = async (req, res, next) => {
  try {
    const date = getDate(req, res);
    const service = await Service.findById(req.params.serviceId);
    if (!service || !service.isActive) fail(res, 404, "Service not found");
    res.json({ success: true, data: await getServiceQueue(service, date) });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/service/:serviceId/waiting   (staff and admin)
export const waitingList = async (req, res, next) => {
  try {
    const date = getDate(req, res);
    const service = await Service.findById(req.params.serviceId);
    if (!service) fail(res, 404, "Service not found");

    const [stats, tokens] = await Promise.all([
      getStats(service),
      Token.find({ serviceId: service._id, date, status: "waiting" }).sort({ priority: -1, seq: 1 }),
    ]);

    const data = tokens.map((t, i) => ({
      position: i + 1,
      _id: t._id,
      tokenNo: t.tokenNo,
      citizenName: t.citizenName,
      mobile: t.mobile,
      priority: t.priority,
      priorityReason: t.priorityReason,
      estimatedWaitMin: estimateWait(i, stats),
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};
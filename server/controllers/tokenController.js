import Token from "../models/Token.js";
import TokenSequence from "../models/TokenSequence.js";
import Service from "../models/Service.js";
import { todayIST, nowHHMM, isValidDate } from "../utils/time.js";

const MAX_DAYS_AHEAD = 7;
const ACTIVE = ["waiting", "in-progress"];

const fail = (res, code, msg) => {
  res.status(code);
  throw new Error(msg);
};

// Is this service open for booking on this date?
const checkBookable = (res, service, date) => {
  if (!service || !service.isActive) fail(res, 404, "Service not available");
  if (!isValidDate(date)) fail(res, 400, "Date must be in YYYY-MM-DD format");
  const today = todayIST();
  if (date < today) fail(res, 400, "Cannot book a past date");
  if (date > todayIST(MAX_DAYS_AHEAD))
    fail(res, 400, `Booking is allowed only ${MAX_DAYS_AHEAD} days ahead`);
  if (date === today && nowHHMM() >= service.closeTime)
    fail(res, 400, `Counters are closed for today (closing time ${service.closeTime})`);
};

// Atomically take the next token number (conflict-free, respects the daily limit)
const takeNumber = async (res, service, date) => {
  try {
    await TokenSequence.updateOne(
      { serviceId: service._id, date },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err; // another request created it first: fine
  }

  // One atomic step: increase only if the limit is not reached yet
  const seqDoc = await TokenSequence.findOneAndUpdate(
    { serviceId: service._id, date, seq: { $lt: service.dailyTokenLimit } },
    { $inc: { seq: 1 } },
    { new: true }
  );
  if (!seqDoc) fail(res, 409, "Daily token limit reached for this service");

  return {
    seq: seqDoc.seq,
    tokenNo: `${service.prefix}-${String(seqDoc.seq).padStart(3, "0")}`,
  };
};

// Finds a waiting token that belongs to the person (mobile must match)
const loadOwnedToken = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) fail(res, 400, "Mobile number is required");
  const token = await Token.findById(req.params.id);
  if (!token || token.mobile !== mobile) fail(res, 404, "Token not found");
  if (token.status !== "waiting") fail(res, 400, `Token is already ${token.status}`);
  return token;
};

// POST /api/tokens
export const createToken = async (req, res, next) => {
  try {
    const { serviceId, citizenName, mobile, email } = req.body;
    const date = req.body.date || todayIST();

    const service = await Service.findById(serviceId);
    checkBookable(res, service, date);

    const dup = await Token.findOne({ serviceId, mobile, date, status: { $in: ACTIVE } });
    if (dup)
      fail(res, 409, `You already have an active token (${dup.tokenNo}) for this service on this date`);

    // Validate first, so a bad request never wastes a token number
    const doc = new Token({
      citizenName, mobile, email, serviceId, date,
      officeId: service.officeId,
      tokenNo: "pending", seq: 0,
    });
    await doc.validate();

    const { seq, tokenNo } = await takeNumber(res, service, date);
    doc.seq = seq;
    doc.tokenNo = tokenNo;
    await doc.save();

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// GET /api/tokens/lookup?tokenNo=I-001&mobile=9876543210&date=2026-11-26
export const lookupToken = async (req, res, next) => {
  try {
    const { tokenNo, mobile } = req.query;
    const date = req.query.date || todayIST();
    if (!tokenNo || !mobile) fail(res, 400, "tokenNo and mobile are required");

    const token = await Token.findOne({
      tokenNo: tokenNo.toUpperCase(), mobile, date,
    }).populate("serviceId", "name department prefix");
    if (!token) fail(res, 404, "Token not found");

    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tokens/:id/cancel   body: { mobile }
export const cancelToken = async (req, res, next) => {
  try {
    const token = await loadOwnedToken(req, res);
    token.status = "cancelled";
    await token.save();
    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tokens/:id/reschedule   body: { mobile, date }
export const rescheduleToken = async (req, res, next) => {
  try {
    const token = await loadOwnedToken(req, res);
    const { date } = req.body;
    if (date === token.date) fail(res, 400, "Token is already on this date");

    const service = await Service.findById(token.serviceId);
    checkBookable(res, service, date);

    const dup = await Token.findOne({
      _id: { $ne: token._id },
      serviceId: token.serviceId,
      mobile: token.mobile,
      date,
      status: { $in: ACTIVE },
    });
    if (dup) fail(res, 409, `You already have an active token (${dup.tokenNo}) on that date`);

    const { seq, tokenNo } = await takeNumber(res, service, date);
    token.date = date;
    token.seq = seq;
    token.tokenNo = tokenNo;
    await token.save();

    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};
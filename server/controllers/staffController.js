import Counter from "../models/Counter.js";
import Token from "../models/Token.js";
import { todayIST } from "../utils/time.js";
import { emitQueueUpdate } from "../socket.js";

const fail = (res, code, msg) => {
  res.status(code);
  throw new Error(msg);
};

const getMyCounter = async (req, res) => {
  if (!req.user.counterId) fail(res, 400, "No counter is assigned to you. Ask the admin.");
  const counter = await Counter.findById(req.user.counterId);
  if (!counter) fail(res, 404, "Your counter no longer exists");
  return counter;
};

const notify = (counter, reason) =>
  counter.serviceIds.forEach((id) => emitQueueUpdate(id, todayIST(), { reason }));

const getCurrent = (counter) =>
  Token.findOne({ counterId: counter._id, status: "in-progress" }).populate(
    "serviceId",
    "name prefix"
  );

// GET /api/staff/counter
export const myCounter = async (req, res, next) => {
  try {
    const counter = await getMyCounter(req, res);
    const [current, waiting] = await Promise.all([
      getCurrent(counter),
      Token.countDocuments({
        serviceId: { $in: counter.serviceIds },
        date: todayIST(),
        status: "waiting",
      }),
    ]);
    res.json({
      success: true,
      counter: { _id: counter._id, name: counter.name, status: counter.status },
      current,
      waiting,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/counter/status   body: { status: "open" | "paused" | "closed" }
export const setStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["open", "paused", "closed"].includes(status)) {
      fail(res, 400, "Status must be open, paused or closed");
    }
    const counter = await getMyCounter(req, res);

    if (status !== "open") {
      const busy = await getCurrent(counter);
      if (busy) fail(res, 400, `Finish token ${busy.tokenNo} first (complete or skip it)`);
    }

    counter.status = status;
    await counter.save();
    notify(counter, `counter-${status}`);
    res.json({ success: true, counter: { _id: counter._id, name: counter.name, status } });
  } catch (err) {
    next(err);
  }
};

// POST /api/staff/counter/call-next
export const callNext = async (req, res, next) => {
  try {
    const counter = await getMyCounter(req, res);
    if (counter.status !== "open") {
      fail(res, 400, `Your counter is ${counter.status}. Open or resume it first`);
    }

    const busy = await getCurrent(counter);
    if (busy) fail(res, 400, `Finish token ${busy.tokenNo} first (complete or skip it)`);

    // One atomic step: two counters can never grab the same token
    const token = await Token.findOneAndUpdate(
      { serviceId: { $in: counter.serviceIds }, date: todayIST(), status: "waiting" },
      { status: "in-progress", counterId: counter._id, calledAt: new Date() },
      { sort: { priority: -1, seq: 1, createdAt: 1 }, new: true }
    ).populate("serviceId", "name prefix");

    if (!token) {
      return res.json({ success: true, data: null, message: "No tokens waiting" });
    }

    emitQueueUpdate(token.serviceId._id, token.date, { reason: "called", tokenNo: token.tokenNo });
    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};

// Shared by complete and skip
const finish = (newStatus) => async (req, res, next) => {
  try {
    const counter = await getMyCounter(req, res);
    const token = await Token.findOneAndUpdate(
      { _id: req.params.id, counterId: counter._id, status: "in-progress" },
      { status: newStatus, completedAt: new Date() },
      { new: true }
    );
    if (!token) fail(res, 404, "No in-progress token with this id at your counter");

    emitQueueUpdate(token.serviceId, token.date, { reason: newStatus, tokenNo: token.tokenNo });
    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/tokens/:id/complete
export const completeToken = finish("completed");

// PUT /api/staff/tokens/:id/skip
export const skipToken = finish("skipped");
import Counter from "../models/Counter.js";
import User from "../models/User.js";

// PUT /api/counters/:id/assign   body: { staffId }  (send staffId: null to unassign)
export const assignStaff = async (req, res, next) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      res.status(404);
      throw new Error("Counter not found");
    }

    // Free the previous staff member, if any
    if (counter.staffId) {
      await User.findByIdAndUpdate(counter.staffId, { counterId: null });
    }

    const { staffId } = req.body;
    if (staffId) {
      const staff = await User.findById(staffId);
      if (!staff || staff.role !== "staff") {
        res.status(400);
        throw new Error("Selected user is not a staff member");
      }
      // A staff member can only run one counter
      await Counter.updateMany({ staffId, _id: { $ne: counter._id } }, { staffId: null });
      staff.counterId = counter._id;
      await staff.save();
    }

    counter.staffId = staffId || null;
    await counter.save();
    res.json({ success: true, data: counter });
  } catch (err) {
    next(err);
  }
};
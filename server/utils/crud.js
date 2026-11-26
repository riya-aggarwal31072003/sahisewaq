const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

export const crud = (Model, { filterKeys = [], populate = "" } = {}) => ({
  getAll: async (req, res, next) => {
    try {
      const filter = pick(req.query, filterKeys);
      if (Model.schema.path("isActive") && req.query.all !== "true") filter.isActive = true;
      let query = Model.find(filter).sort("-createdAt");
      if (populate) query = query.populate(populate);
      const data = await query;
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  getOne: async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);
      if (populate) query = query.populate(populate);
      const data = await query;
      if (!data) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = await Model.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!data) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data) {
        res.status(404);
        throw new Error(`${Model.modelName} not found`);
      }
      // Soft delete if the model has isActive, otherwise delete for real
      if (Model.schema.path("isActive")) {
        data.isActive = false;
        await data.save();
      } else {
        await data.deleteOne();
      }
      res.json({ success: true, message: `${Model.modelName} removed` });
    } catch (err) {
      next(err);
    }
  },
});
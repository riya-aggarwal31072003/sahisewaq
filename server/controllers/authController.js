import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  officeId: user.officeId,
  counterId: user.counterId,
});

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    res.json({ success: true, token: generateToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = (req, res) => {
  res.json({ success: true, user: userResponse(req.user) });
};

// POST /api/auth/register (admin only: creates staff or admin accounts)
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, officeId, counterId } = req.body;
    const user = await User.create({ name, email, password, role, officeId, counterId });
    res.status(201).json({ success: true, user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};
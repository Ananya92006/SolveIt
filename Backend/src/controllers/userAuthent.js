const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");

// Helper: cookie options for cross-domain (Vercel <-> Render)
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL;
  return {
    maxAge,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
};

const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password, adminSecretCode } = req.body;

    const validAdminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';
    const role = (adminSecretCode && adminSecretCode.trim() === validAdminSecret) ? 'admin' : 'user';

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = role;

    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.cookie('token', token, getCookieOptions(60 * 60 * 24 * 1000));
    res.status(201).json({
      user: reply,
      message: role === 'admin' ? "Registered successfully as Admin!" : "Registered successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password, adminSecretCode } = req.body;

    if (!emailId) throw new Error("Invalid Credentials");
    if (!password) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid Credentials");

    const validAdminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';
    if (adminSecretCode && adminSecretCode.trim() === validAdminSecret && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    res.cookie('token', token, getCookieOptions(60 * 60 * 24 * 1000));
    res.status(201).json({
      user: reply,
      message: user.role === 'admin' ? "Logged in as Admin" : "Logged in successfully",
    });
  } catch (err) {
    res.status(401).json({ message: err.message || "Login failed" });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const { passcode } = req.body;
    const validAdminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

    if (!passcode || passcode.trim() !== validAdminSecret) {
      return res.status(400).json({ message: "Invalid Admin Passcode! Use 'admin123'." });
    }

    const userId = req.result._id;
    const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: 'admin' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: 'admin',
    };

    res.cookie('token', token, getCookieOptions(60 * 60 * 24 * 1000));
    res.status(200).json({
      user: reply,
      message: "Congratulations! You are now an Admin 🎉",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to make admin" });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const payload = jwt.decode(token);
      if (payload?.exp) {
        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);
      }
    }

    res.cookie("token", null, { ...getCookieOptions(0), expires: new Date(Date.now()) });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Logout failed" });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'admin';

    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    res.cookie('token', token, getCookieOptions(60 * 60 * 24 * 1000));
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Registration failed" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    await Submission.deleteMany({ userId });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout, makeAdmin, adminRegister, deleteProfile };
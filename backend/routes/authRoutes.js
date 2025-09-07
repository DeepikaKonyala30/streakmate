import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Input validation function
const validateInput = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new ApiError(400, 'Invalid email format');
  }
};

// Controller functions
const signup = async (req, res) => {
  console.log("signup route hit");
  const { name, email, password } = req.body;
  try {
    validateInput(req.body, ['name', 'email', 'password']);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      success: true,
      token,
      user: { name, email },
    });
    console.log("New User registered successfully");
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    validateInput(req.body, ['email', 'password']);

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, 'Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      token,
      user: { name: user.name, email },
    });
    console.log("User loggged in successfully");
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed!',
    user: req.user,
  });
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

// Initialize router
const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/dashboard', authMiddleware, getDashboard);
router.get('/me', authMiddleware, getUserProfile);

export default router;
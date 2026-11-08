const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'taskflow_pro_jwt_secret_super_secure_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      githubUrl: 'https://github.com/alexmorgan-dev',
      githubUsername: 'alexmorgan-dev',
      bitbucketUrl: 'https://bitbucket.org/alexmorgan/taskflow-pro',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      portfolioUrl: 'https://alexmorgan.dev',
      bio: 'Full-Stack Developer & DevOps Practitioner | Building cloud-native web systems',
      skills: ['React', 'Node.js', 'Docker', 'MongoDB', 'TypeScript', 'TailwindCSS'],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      githubUrl,
      githubUsername,
      bitbucketUrl,
      linkedinUrl,
      portfolioUrl,
      bio,
      skills,
    } = req.body;

    if (name) user.name = name.trim();
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (githubUsername !== undefined) user.githubUsername = githubUsername.trim();
    if (bitbucketUrl !== undefined) user.bitbucketUrl = bitbucketUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (Array.isArray(skills)) user.skills = skills;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Developer profile updated successfully',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};

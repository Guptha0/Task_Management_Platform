const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    // Developer Profile & Social Integrations
    githubUrl: {
      type: String,
      default: 'https://github.com/alexmorgan-dev',
      trim: true,
    },
    githubUsername: {
      type: String,
      default: 'alexmorgan-dev',
      trim: true,
    },
    bitbucketUrl: {
      type: String,
      default: 'https://bitbucket.org/alexmorgan/taskflow-pro',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: 'https://linkedin.com/in/alexmorgan-dev',
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: 'https://alexmorgan.dev',
      trim: true,
    },
    bio: {
      type: String,
      default: 'Full-Stack Developer & DevOps Practitioner | Building cloud-native web systems',
      trim: true,
    },
    skills: {
      type: [String],
      default: ['React', 'Node.js', 'Docker', 'MongoDB', 'TypeScript', 'TailwindCSS', 'Express'],
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify entered password against hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON serialization
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    githubUrl: this.githubUrl,
    githubUsername: this.githubUsername,
    bitbucketUrl: this.bitbucketUrl,
    linkedinUrl: this.linkedinUrl,
    portfolioUrl: this.portfolioUrl,
    bio: this.bio,
    skills: this.skills,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);

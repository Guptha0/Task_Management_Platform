const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      default: 'Alex Morgan',
    },
    userName: {
      type: String,
      required: true,
      default: 'Alex Morgan',
    },
    userAvatar: {
      type: String,
      default: 'AM',
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    field: {
      type: String,
      default: '',
    },
    from: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: '',
    },
    user: {
      type: String,
      default: 'Alex Morgan',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const assigneeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Unassigned',
    },
    email: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'UN',
    },
    role: {
      type: String,
      default: 'Contributor',
    },
  },
  { _id: false }
);

const linkedPRSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    number: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Open', 'Merged', 'Failed CI/CD', 'Draft', 'None'],
      default: 'None',
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['To Do', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'To Do',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
      index: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Advanced Collaborative & DevOps Fields
    assignee: {
      type: assigneeSchema,
      default: () => ({
        name: 'Alex Morgan',
        email: 'alex@taskflow.com',
        avatar: 'AM',
        role: 'Lead Architect',
      }),
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    storyPoints: {
      type: Number,
      default: 3,
      min: 0,
    },
    techStack: {
      type: [String],
      default: ['Full-Stack'],
    },
    linkedPR: {
      type: linkedPRSchema,
      default: () => ({
        title: '',
        url: '',
        number: 0,
        status: 'None',
      }),
    },
    commitHash: {
      type: String,
      default: '',
      trim: true,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    activityLog: {
      type: [activityLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indices for fast queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);

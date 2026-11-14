import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index so we don't have duplicate (className + section)
classSchema.index({ className: 1, section: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);

export default Class;


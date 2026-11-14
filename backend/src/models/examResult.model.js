import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: 1,
    },
    obtainedMarks: {
      type: Number,
      required: [true, 'Obtained marks are required'],
      min: 0,
    },
  },
  { timestamps: true }
);

const ExamResult = mongoose.model('ExamResult', examResultSchema);

export default ExamResult;


import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;


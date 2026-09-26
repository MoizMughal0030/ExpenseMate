import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be greater than 0'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be 2100 or earlier'],
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

export default Budget;

export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongodb.js';
import Budget from '../../../../models/Budget.js';
import Transaction from '../../../../models/Transaction.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { calculateBudgetAlert } from '../../../../utils/analytics/budgetAlerts.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * GET /api/analytics/budget-summary
 * Computes high-level budget usage, remaining budget, and category progress
 */
export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const url = new URL(req.url);
    const now = new Date();
    const month = parseInt(url.searchParams.get('month') || String(now.getUTCMonth() + 1), 10);
    const year = parseInt(url.searchParams.get('year') || String(now.getUTCFullYear()), 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return errorResponse('Month must be between 1 and 12', 400);
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      return errorResponse('Year must be between 2000 and 2100', 400);
    }

    await connectToDatabase();

    const userObjectId = new mongoose.Types.ObjectId(user.id);

    // 1. Fetch all budgets for the specified month
    const budgets = await Budget.find({
      userId: userObjectId,
      month,
      year,
    }).lean();

    // 2. Fetch actual expenses for the month
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $toLower: '$category' },
          categoryName: { $first: '$category' },
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = new Map();
    let totalAllExpensesInMonth = 0;
    for (const exp of expensesByCategory) {
      spendingMap.set(exp._id, {
        categoryName: exp.categoryName,
        totalSpent: Math.round(exp.totalSpent * 100) / 100,
      });
      totalAllExpensesInMonth += exp.totalSpent;
    }

    let totalBudget = 0;
    let totalSpentAgainstBudget = 0;

    const categoryProgress = budgets.map((b) => {
      const catKey = b.category.toLowerCase().trim();
      const actualSpent = spendingMap.has(catKey) ? spendingMap.get(catKey).totalSpent : 0;

      totalBudget += b.amount;
      totalSpentAgainstBudget += actualSpent;

      const alert = calculateBudgetAlert(b.amount, actualSpent);

      return {
        budgetId: b._id.toString(),
        category: b.category,
        budgetAmount: b.amount,
        actualSpent,
        remainingBudget: alert.remainingAmount,
        budgetPercentageUsed: alert.percentageUsed,
        status: alert.status,
        severity: alert.severity,
      };
    });

    const remainingBudget = Math.round((totalBudget - totalSpentAgainstBudget) * 100) / 100;
    const budgetPercentageUsed = totalBudget > 0
      ? Math.round((totalSpentAgainstBudget / totalBudget) * 10000) / 100
      : 0;

    return successResponse({
      period: { month, year },
      summary: {
        totalBudget: Math.round(totalBudget * 100) / 100,
        totalSpent: Math.round(totalSpentAgainstBudget * 100) / 100,
        totalAllExpensesInMonth: Math.round(totalAllExpensesInMonth * 100) / 100,
        remainingBudget,
        budgetPercentageUsed,
        budgetsCount: budgets.length,
      },
      categoryProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

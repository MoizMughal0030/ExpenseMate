export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongodb.js';
import Budget from '../../../../models/Budget.js';
import Transaction from '../../../../models/Transaction.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { calculateBudgetAlert } from '../../../../utils/analytics/budgetAlerts.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * GET /api/budgets/alerts
 * Calculate spending against budgets and return threshold alerts (Normal, Warning, Exceeded)
 * Query params: month (1-12), year (e.g. 2026), warningThreshold (optional float e.g. 0.75)
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
    const customThreshold = url.searchParams.get('warningThreshold')
      ? parseFloat(url.searchParams.get('warningThreshold'))
      : undefined;

    if (isNaN(month) || month < 1 || month > 12) {
      return errorResponse('Month must be an integer between 1 and 12', 400);
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      return errorResponse('Year must be between 2000 and 2100', 400);
    }

    await connectToDatabase();

    // 1. Fetch all budgets for the user in this month and year
    const budgets = await Budget.find({
      userId: user.id,
      month,
      year,
    }).lean();

    // 2. Fetch actual expenses for the month grouped by category
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user.id),
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

    // Map spending by lowercase category
    const spendingMap = new Map();
    for (const item of expensesByCategory) {
      spendingMap.set(item._id, {
        categoryName: item.categoryName,
        totalSpent: Math.round(item.totalSpent * 100) / 100,
      });
    }

    // 3. Evaluate alerts for each budget
    let totalBudgeted = 0;
    let totalSpentAgainstBudget = 0;
    let exceededCount = 0;
    let warningCount = 0;

    const categoryAlerts = budgets.map((b) => {
      const catKey = b.category.toLowerCase().trim();
      const actualSpent = spendingMap.has(catKey) ? spendingMap.get(catKey).totalSpent : 0;
      totalBudgeted += b.amount;
      totalSpentAgainstBudget += actualSpent;

      const alert = calculateBudgetAlert(b.amount, actualSpent, {
        warningThreshold: customThreshold,
      });

      if (alert.status === 'EXCEEDED') exceededCount++;
      if (alert.status === 'WARNING') warningCount++;

      return {
        budgetId: b._id.toString(),
        category: b.category,
        budgetAmount: b.amount,
        actualSpent,
        remainingAmount: alert.remainingAmount,
        percentageUsed: alert.percentageUsed,
        status: alert.status,
        severity: alert.severity,
        message: alert.message,
        isOverBudget: alert.isOverBudget,
        isNearBudget: alert.isNearBudget,
      };
    });

    const overallRemaining = Math.round((totalBudgeted - totalSpentAgainstBudget) * 100) / 100;
    const overallPercentage = totalBudgeted > 0
      ? Math.round((totalSpentAgainstBudget / totalBudgeted) * 10000) / 100
      : 0;

    return successResponse({
      period: { month, year },
      summary: {
        totalBudgeted: Math.round(totalBudgeted * 100) / 100,
        totalSpent: Math.round(totalSpentAgainstBudget * 100) / 100,
        totalRemaining: overallRemaining,
        overallPercentageUsed: overallPercentage,
        totalBudgets: budgets.length,
        exceededCount,
        warningCount,
        normalCount: budgets.length - exceededCount - warningCount,
      },
      alerts: categoryAlerts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

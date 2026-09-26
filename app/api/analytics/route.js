export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/mongodb.js';
import Transaction from '../../../models/Transaction.js';
import { getAuthUser } from '../../../lib/auth.js';
import { calculateNetBalance, calculatePercentage, aggregateCategoryBreakdown } from '../../../utils/analytics/financialCalculations.js';
import { successResponse, errorResponse, handleApiError } from '../../../utils/response.js';

/**
 * GET /api/analytics
 * Calculates dashboard statistics:
 * - Total income & expenses (all-time)
 * - Current balance
 * - Monthly income & expenses (selected or current month)
 * - Category-wise expense and income breakdown
 * - 6-month historical trend
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

    // 1. All-time income and expense totals
    const allTimeTotals = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const t of allTimeTotals) {
      if (t._id === 'income') totalIncome = Math.round(t.total * 100) / 100;
      if (t._id === 'expense') totalExpenses = Math.round(t.total * 100) / 100;
    }
    const currentBalance = calculateNetBalance(totalIncome, totalExpenses);

    // 2. Selected month totals
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    for (const m of monthlyTotals) {
      if (m._id === 'income') monthlyIncome = Math.round(m.total * 100) / 100;
      if (m._id === 'expense') monthlyExpenses = Math.round(m.total * 100) / 100;
    }
    const monthlyNetSavings = calculateNetBalance(monthlyIncome, monthlyExpenses);
    const savingsRate = calculatePercentage(monthlyNetSavings, monthlyIncome);

    // 3. Category-wise expense breakdown for the selected month
    const categoryExpensesRaw = await Transaction.aggregate([
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
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
    const categoryExpenses = aggregateCategoryBreakdown(categoryExpensesRaw, monthlyExpenses);

    // 4. Category-wise income breakdown for the selected month
    const categoryIncomeRaw = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'income',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $toLower: '$category' },
          categoryName: { $first: '$category' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
    const categoryIncome = aggregateCategoryBreakdown(categoryIncomeRaw, monthlyIncome);

    // 5. Monthly trend for past 6 months
    const sixMonthsAgo = new Date(Date.UTC(year, month - 6, 1));
    const trendsRaw = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: sixMonthsAgo, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Build map of month trends
    const trendMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month - 1 - i, 1));
      const mNum = d.getUTCMonth() + 1;
      const yNum = d.getUTCFullYear();
      const key = `${yNum}-${String(mNum).padStart(2, '0')}`;
      trendMap.set(key, {
        period: key,
        month: mNum,
        year: yNum,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    for (const item of trendsRaw) {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (trendMap.has(key)) {
        const entry = trendMap.get(key);
        const amount = Math.round(item.total * 100) / 100;
        if (item._id.type === 'income') entry.income = amount;
        if (item._id.type === 'expense') entry.expense = amount;
        entry.net = calculateNetBalance(entry.income, entry.expense);
      }
    }

    const monthlyTrends = Array.from(trendMap.values());

    return successResponse({
      period: { month, year },
      overview: {
        totalIncome,
        totalExpenses,
        currentBalance,
      },
      monthlySummary: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        netSavings: monthlyNetSavings,
        savingsRate,
      },
      categoryExpenses,
      categoryIncome,
      monthlyTrends,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/mongodb.js';
import Budget from '../../../models/Budget.js';
import { getAuthUser } from '../../../lib/auth.js';
import { validateBudgetInput, validateBudgetQuery } from '../../../utils/validation/budgetValidation.js';
import { successResponse, errorResponse, handleApiError } from '../../../utils/response.js';

/**
 * POST /api/budgets
 * Create a monthly/category budget for the authenticated user
 */
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to create budgets', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const { isValid, errors, data } = validateBudgetInput(body, false);
    if (!isValid) {
      return errorResponse('Validation failed', 400, errors);
    }

    await connectToDatabase();

    // Check for existing budget for same category, month, and year
    const existing = await Budget.findOne({
      userId: user.id,
      category: data.category,
      month: data.month,
      year: data.year,
    });

    if (existing) {
      return errorResponse(
        `A budget for category '${data.category}' already exists for ${data.month}/${data.year}. Use PUT to update it.`,
        409
      );
    }

    const budget = await Budget.create({
      userId: user.id,
      category: data.category,
      amount: data.amount,
      month: data.month,
      year: data.year,
    });

    return successResponse(
      {
        id: budget._id.toString(),
        category: budget.category,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
      201,
      'Budget created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/budgets
 * Retrieve budgets for the authenticated user with optional month/year filters
 */
export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to view budgets', 401);
    }

    const url = new URL(req.url);
    const { isValid, errors, filters } = validateBudgetQuery(url.searchParams);
    if (!isValid) {
      return errorResponse('Invalid query parameters', 400, errors);
    }

    await connectToDatabase();

    const query = { userId: user.id };
    if (filters.month) query.month = filters.month;
    if (filters.year) query.year = filters.year;
    if (filters.category) query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };

    const budgets = await Budget.find(query).sort({ year: -1, month: -1, category: 1 }).lean();

    const formattedBudgets = budgets.map((b) => ({
      id: b._id.toString(),
      category: b.category,
      amount: b.amount,
      month: b.month,
      year: b.year,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return successResponse({
      budgets: formattedBudgets,
      total: formattedBudgets.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

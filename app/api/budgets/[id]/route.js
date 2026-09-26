import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongodb.js';
import Budget from '../../../../models/Budget.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { validateBudgetInput } from '../../../../utils/validation/budgetValidation.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * GET /api/budgets/[id]
 * Retrieve a single budget by ID
 */
export async function GET(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid budget ID format', 400);
    }

    await connectToDatabase();

    const budget = await Budget.findOne({ _id: id, userId: user.id }).lean();
    if (!budget) {
      return errorResponse('Budget not found or access denied', 404);
    }

    return successResponse({
      id: budget._id.toString(),
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/budgets/[id]
 * Update a budget's amount or category
 */
export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid budget ID format', 400);
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const { isValid, errors, data } = validateBudgetInput(body, true);
    if (!isValid) {
      return errorResponse('Validation failed', 400, errors);
    }

    if (Object.keys(data).length === 0) {
      return errorResponse('No fields provided to update', 400);
    }

    await connectToDatabase();

    const updated = await Budget.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return errorResponse('Budget not found or access denied', 404);
    }

    return successResponse(
      {
        id: updated._id.toString(),
        category: updated.category,
        amount: updated.amount,
        month: updated.month,
        year: updated.year,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      200,
      'Budget updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid budget ID format', 400);
    }

    await connectToDatabase();

    const deleted = await Budget.findOneAndDelete({ _id: id, userId: user.id });
    if (!deleted) {
      return errorResponse('Budget not found or access denied', 404);
    }

    return successResponse({ id: deleted._id.toString() }, 200, 'Budget deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

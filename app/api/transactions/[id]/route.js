import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongodb.js';
import Transaction from '../../../../models/Transaction.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { validateTransactionInput } from '../../../../utils/validation/transactionValidation.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * GET /api/transactions/[id]
 * Fetch a single transaction by ID (scoped to authenticated user)
 */
export async function GET(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid transaction ID format', 400);
    }

    await connectToDatabase();

    const transaction = await Transaction.findOne({ _id: id, userId: user.id }).lean();
    if (!transaction) {
      return errorResponse('Transaction not found or access denied', 404);
    }

    return successResponse({
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/transactions/[id]
 * Update an existing transaction (scoped to authenticated user)
 */
export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid transaction ID format', 400);
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const { isValid, errors, data } = validateTransactionInput(body, true);
    if (!isValid) {
      return errorResponse('Validation failed', 400, errors);
    }

    if (Object.keys(data).length === 0) {
      return errorResponse('No fields provided to update', 400);
    }

    await connectToDatabase();

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTransaction) {
      return errorResponse('Transaction not found or access denied', 404);
    }

    return successResponse(
      {
        id: updatedTransaction._id.toString(),
        type: updatedTransaction.type,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        description: updatedTransaction.description,
        date: updatedTransaction.date,
        createdAt: updatedTransaction.createdAt,
        updatedAt: updatedTransaction.updatedAt,
      },
      200,
      'Transaction updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction (scoped to authenticated user)
 */
export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid transaction ID format', 400);
    }

    await connectToDatabase();

    const deleted = await Transaction.findOneAndDelete({ _id: id, userId: user.id });
    if (!deleted) {
      return errorResponse('Transaction not found or access denied', 404);
    }

    return successResponse(
      { id: deleted._id.toString() },
      200,
      'Transaction deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

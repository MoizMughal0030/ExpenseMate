export const dynamic = 'force-dynamic';
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/mongodb.js';
import Transaction from '../../../models/Transaction.js';
import { getAuthUser } from '../../../lib/auth.js';
import { validateTransactionInput, validateTransactionQuery } from '../../../utils/validation/transactionValidation.js';
import { successResponse, errorResponse, handleApiError } from '../../../utils/response.js';

/**
 * POST /api/transactions
 * Create a new income or expense transaction for the authenticated user
 */
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to create transactions', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const { isValid, errors, data } = validateTransactionInput(body, false);
    if (!isValid) {
      return errorResponse('Validation failed', 400, errors);
    }

    await connectToDatabase();

    const transaction = await Transaction.create({
      userId: user.id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || '',
      date: data.date || new Date(),
    });

    return successResponse(transaction, 201, 'Transaction created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/transactions
 * Retrieve transactions for the authenticated user with optional filters
 * Filters supported: type, category, month, year, startDate, endDate, search, page, limit, sort
 */
export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to view transactions', 401);
    }

    const url = new URL(req.url);
    const { isValid, errors, filters } = validateTransactionQuery(url.searchParams);
    if (!isValid) {
      return errorResponse('Invalid query parameters', 400, errors);
    }

    await connectToDatabase();

    // Enforce user ownership in MongoDB query filter
    const query = { userId: user.id };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.category) {
      query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
    }

    if (filters.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Month and Year filtering
    if (filters.month && filters.year) {
      const startOfMonth = new Date(Date.UTC(filters.year, filters.month - 1, 1));
      const endOfMonth = new Date(Date.UTC(filters.year, filters.month, 0, 23, 59, 59, 999));
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (filters.year) {
      const startOfYear = new Date(Date.UTC(filters.year, 0, 1));
      const endOfYear = new Date(Date.UTC(filters.year, 11, 31, 23, 59, 59, 999));
      query.date = { $gte: startOfYear, $lte: endOfYear };
    } else if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    // Sort order definition
    let sortOption = { date: -1, _id: -1 };
    if (filters.sort === 'date_asc') sortOption = { date: 1, _id: 1 };
    else if (filters.sort === 'amount_desc') sortOption = { amount: -1, date: -1 };
    else if (filters.sort === 'amount_asc') sortOption = { amount: 1, date: -1 };

    const totalRecords = await Transaction.countDocuments(query);
    const skip = (filters.page - 1) * filters.limit;

    const transactions = await Transaction.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(filters.limit)
      .lean();

    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return successResponse({
      transactions: formattedTransactions,
      pagination: {
        total: totalRecords,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(totalRecords / filters.limit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

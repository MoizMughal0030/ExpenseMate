export const dynamic = 'force-dynamic';
import connectToDatabase from '../../../../lib/mongodb.js';
import Transaction from '../../../../models/Transaction.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { generateCsvFromTransactions } from '../../../../utils/csv/csvGenerator.js';
import { errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * GET /api/csv/export
 * Exports authenticated user's transactions as a downloadable CSV file
 */
export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to export transactions', 401);
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const month = parseInt(url.searchParams.get('month'), 10);
    const year = parseInt(url.searchParams.get('year'), 10);

    await connectToDatabase();

    const query = { userId: user.id };
    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (!isNaN(year)) {
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    const csvData = generateCsvFromTransactions(transactions);

    const today = new Date().toISOString().split('T')[0];
    const filename = `expensemate_transactions_${today}.csv`;

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import connectToDatabase from '../../../../lib/mongodb.js';
import Transaction from '../../../../models/Transaction.js';
import { getAuthUser } from '../../../../lib/auth.js';
import { parseAndValidateCsv } from '../../../../utils/csv/csvParser.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

/**
 * POST /api/csv/import
 * Imports transactions from CSV for the authenticated user
 * Supports multipart/form-data, text/csv, and JSON ({ csvContent: "..." })
 */
export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Unauthorized: Please log in to import transactions', 401);
    }

    let csvContent = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      if (!file) {
        return errorResponse("No file uploaded. Expected 'file' field in form data", 400);
      }
      csvContent = await file.text();
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      csvContent = await req.text();
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      csvContent = body.csvContent || body.csv || '';
    } else {
      // Fallback attempt to read text
      csvContent = await req.text();
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return errorResponse('Empty CSV content provided', 400);
    }

    const { isValid, totalRows, validRecords, invalidRows, summary } = parseAndValidateCsv(
      csvContent,
      user.id
    );

    if (!isValid || validRecords.length === 0) {
      return errorResponse('No valid transactions found in CSV. Database was not modified.', 400, {
        summary,
        totalRows,
        rejectedRowsCount: invalidRows.length,
        errors: invalidRows,
      });
    }

    await connectToDatabase();

    const inserted = await Transaction.insertMany(validRecords, { ordered: false });

    return successResponse(
      {
        summary,
        totalRows,
        importedCount: inserted.length,
        rejectedCount: invalidRows.length,
        rejectedRows: invalidRows,
      },
      201,
      `Successfully imported ${inserted.length} transactions`
    );
  } catch (error) {
    return handleApiError(error);
  }
}

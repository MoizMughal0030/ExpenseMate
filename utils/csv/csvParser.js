/**
 * Robust CSV line splitter that handles quoted strings containing commas and escaped quotes
 */
export function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses and validates CSV content for transaction import
 * Expected columns: Date, Type, Category, Amount, Description (case-insensitive header match)
 */
export function parseAndValidateCsv(csvContent, userId) {
  if (!csvContent || typeof csvContent !== 'string') {
    return {
      isValid: false,
      totalRows: 0,
      validRecords: [],
      invalidRows: [],
      summary: 'CSV content is empty or invalid',
    };
  }

  // Split lines across CRLF or LF
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return {
      isValid: false,
      totalRows: 0,
      validRecords: [],
      invalidRows: [],
      summary: 'CSV must contain at least a header row and one data row',
    };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));

  const dateIdx = headers.findIndex((h) => h === 'date');
  const typeIdx = headers.findIndex((h) => h === 'type');
  const categoryIdx = headers.findIndex((h) => h === 'category');
  const amountIdx = headers.findIndex((h) => h === 'amount');
  const descIdx = headers.findIndex((h) => h === 'description' || h === 'desc' || h === 'note');

  if (dateIdx === -1 || typeIdx === -1 || categoryIdx === -1 || amountIdx === -1) {
    return {
      isValid: false,
      totalRows: lines.length - 1,
      validRecords: [],
      invalidRows: [],
      summary: `Missing required CSV headers. Required: Date, Type, Category, Amount. Found: ${rawHeaders.join(', ')}`,
    };
  }

  const validRecords = [];
  const invalidRows = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const values = parseCsvLine(lines[i]);
    const rowErrors = [];

    const rawDate = values[dateIdx];
    const rawType = values[typeIdx];
    const rawCategory = values[categoryIdx];
    const rawAmount = values[amountIdx];
    const rawDesc = descIdx !== -1 ? values[descIdx] : '';

    // 1. Date validation
    const parsedDate = new Date(rawDate);
    if (!rawDate || isNaN(parsedDate.getTime())) {
      rowErrors.push(`Invalid date format '${rawDate}'`);
    }

    // 2. Type validation
    const cleanedType = (rawType || '').toLowerCase().trim();
    if (cleanedType !== 'income' && cleanedType !== 'expense') {
      rowErrors.push(`Invalid type '${rawType}'. Must be 'income' or 'expense'`);
    }

    // 3. Category validation
    const cleanedCategory = (rawCategory || '').trim();
    if (!cleanedCategory) {
      rowErrors.push('Category is required');
    } else if (cleanedCategory.length > 50) {
      rowErrors.push('Category cannot exceed 50 characters');
    }

    // 4. Amount validation
    const parsedAmount = parseFloat((rawAmount || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      rowErrors.push(`Invalid amount '${rawAmount}'. Must be a positive number`);
    }

    // 5. Description validation
    const cleanedDesc = (rawDesc || '').trim();
    if (cleanedDesc.length > 255) {
      rowErrors.push('Description cannot exceed 255 characters');
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber,
        rawLine: lines[i],
        errors: rowErrors,
      });
    } else {
      validRecords.push({
        userId,
        type: cleanedType,
        amount: Math.round(parsedAmount * 100) / 100,
        category: cleanedCategory,
        description: cleanedDesc,
        date: parsedDate,
      });
    }
  }

  return {
    isValid: validRecords.length > 0,
    totalRows: lines.length - 1,
    validRecords,
    invalidRows,
    summary: `Processed ${lines.length - 1} rows: ${validRecords.length} valid, ${invalidRows.length} rejected`,
  };
}

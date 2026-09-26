const VALID_TYPES = ['income', 'expense'];

/**
 * Validates transaction creation or update payload
 */
export function validateTransactionInput(data, isUpdate = false) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const { type, amount, category, description, date } = data;

  // Type validation
  if (!isUpdate || type !== undefined) {
    if (!type || !VALID_TYPES.includes(type.toLowerCase())) {
      errors.push("Type is required and must be either 'income' or 'expense'");
    }
  }

  // Amount validation
  if (!isUpdate || amount !== undefined) {
    const numAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount is required and must be a positive number greater than 0');
    }
  }

  // Category validation
  if (!isUpdate || category !== undefined) {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category is required');
    } else if (category.trim().length > 50) {
      errors.push('Category cannot exceed 50 characters');
    }
  }

  // Description validation
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('Description must be a text string');
    } else if (description.trim().length > 255) {
      errors.push('Description cannot exceed 255 characters');
    }
  }

  // Date validation
  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Date must be a valid date format');
    }
  }

  const cleanedData = {};
  if (type !== undefined) cleanedData.type = type.toLowerCase();
  if (amount !== undefined) cleanedData.amount = Math.round(Number(amount) * 100) / 100;
  if (category !== undefined) cleanedData.category = category.trim();
  if (description !== undefined) cleanedData.description = description.trim();
  if (date !== undefined) cleanedData.date = new Date(date);

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanedData,
  };
}

/**
 * Validates and parses query filter parameters
 */
export function validateTransactionQuery(searchParams) {
  const errors = [];
  const filters = {};

  const type = searchParams.get('type');
  if (type) {
    if (!VALID_TYPES.includes(type.toLowerCase())) {
      errors.push("Query parameter 'type' must be either 'income' or 'expense'");
    } else {
      filters.type = type.toLowerCase();
    }
  }

  const category = searchParams.get('category');
  if (category) {
    filters.category = category.trim();
  }

  const search = searchParams.get('search');
  if (search) {
    filters.search = search.trim();
  }

  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (month) {
    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      errors.push("Query parameter 'month' must be an integer between 1 and 12");
    } else {
      filters.month = m;
    }
  }

  if (year) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 2000 || y > 2100) {
      errors.push("Query parameter 'year' must be a valid year between 2000 and 2100");
    } else {
      filters.year = y;
    }
  }

  const startDate = searchParams.get('startDate');
  if (startDate) {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) {
      errors.push("Query parameter 'startDate' is not a valid date");
    } else {
      filters.startDate = d;
    }
  }

  const endDate = searchParams.get('endDate');
  if (endDate) {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) {
      errors.push("Query parameter 'endDate' is not a valid date");
    } else {
      // Set to end of day if only YYYY-MM-DD was provided
      d.setHours(23, 59, 59, 999);
      filters.endDate = d;
    }
  }

  // Pagination & sorting
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const sort = searchParams.get('sort') || 'date_desc';

  filters.page = isNaN(page) || page < 1 ? 1 : page;
  filters.limit = isNaN(limit) || limit < 1 || limit > 500 ? 50 : limit;
  filters.sort = sort;

  return {
    isValid: errors.length === 0,
    errors,
    filters,
  };
}

/**
 * Validates budget creation or update payload
 */
export function validateBudgetInput(data, isUpdate = false) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const { category, amount, month, year } = data;

  // Category validation
  if (!isUpdate || category !== undefined) {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category is required');
    } else if (category.trim().length > 50) {
      errors.push('Category cannot exceed 50 characters');
    }
  }

  // Amount validation
  if (!isUpdate || amount !== undefined) {
    const numAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numAmount) || numAmount <= 0) {
      errors.push('Budget amount is required and must be a positive number greater than 0');
    }
  }

  // Month validation
  if (!isUpdate || month !== undefined) {
    const numMonth = parseInt(month, 10);
    if (month === undefined || month === null || isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
      errors.push('Month is required and must be an integer between 1 and 12');
    }
  }

  // Year validation
  if (!isUpdate || year !== undefined) {
    const numYear = parseInt(year, 10);
    if (year === undefined || year === null || isNaN(numYear) || numYear < 2000 || numYear > 2100) {
      errors.push('Year is required and must be between 2000 and 2100');
    }
  }

  const cleanedData = {};
  if (category !== undefined) cleanedData.category = category.trim();
  if (amount !== undefined) cleanedData.amount = Math.round(Number(amount) * 100) / 100;
  if (month !== undefined) cleanedData.month = parseInt(month, 10);
  if (year !== undefined) cleanedData.year = parseInt(year, 10);

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanedData,
  };
}

/**
 * Validates query parameters for budgets
 */
export function validateBudgetQuery(searchParams) {
  const errors = [];
  const filters = {};

  const month = searchParams.get('month');
  if (month) {
    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      errors.push("Query parameter 'month' must be an integer between 1 and 12");
    } else {
      filters.month = m;
    }
  }

  const year = searchParams.get('year');
  if (year) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 2000 || y > 2100) {
      errors.push("Query parameter 'year' must be between 2000 and 2100");
    } else {
      filters.year = y;
    }
  }

  const category = searchParams.get('category');
  if (category) {
    filters.category = category.trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    filters,
  };
}

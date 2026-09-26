/**
 * Calculates net balance
 */
export function calculateNetBalance(income, expense) {
  const inc = Number(income) || 0;
  const exp = Number(expense) || 0;
  return Math.round((inc - exp) * 100) / 100;
}

/**
 * Calculates percentage safely avoiding division by zero
 */
export function calculatePercentage(part, whole) {
  const p = Number(part) || 0;
  const w = Number(whole) || 0;
  if (w <= 0) return 0;
  return Math.round((p / w) * 10000) / 100;
}

/**
 * Aggregates transactions by category and calculates percentages
 */
export function aggregateCategoryBreakdown(items, totalAmount) {
  const total = Number(totalAmount) || 0;
  return items.map((item) => {
    const amount = Math.round(item.totalAmount * 100) / 100;
    const percentage = total > 0 ? Math.round((amount / total) * 10000) / 100 : 0;
    return {
      category: item.categoryName || item._id,
      totalAmount: amount,
      count: item.count,
      percentage,
    };
  });
}

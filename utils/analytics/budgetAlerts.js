/**
 * Configurable budget alert thresholds
 */
export const DEFAULT_WARNING_THRESHOLD = parseFloat(process.env.BUDGET_WARNING_THRESHOLD || '0.80');
export const DEFAULT_EXCEEDED_THRESHOLD = 1.0;

/**
 * Calculates the alert status and metrics for a budget vs actual spending
 *
 * @param {number} budgetAmount - The allocated budget
 * @param {number} actualSpent - The actual spending for the category in the period
 * @param {object} options - Optional custom threshold overrides
 * @returns {object} Status, percentage, remaining, and user message
 */
export function calculateBudgetAlert(budgetAmount, actualSpent, options = {}) {
  const warningThreshold = typeof options.warningThreshold === 'number'
    ? options.warningThreshold
    : DEFAULT_WARNING_THRESHOLD;
  const exceededThreshold = typeof options.exceededThreshold === 'number'
    ? options.exceededThreshold
    : DEFAULT_EXCEEDED_THRESHOLD;

  const budget = Math.max(0, Number(budgetAmount) || 0);
  const spent = Math.max(0, Number(actualSpent) || 0);
  const remaining = Math.round((budget - spent) * 100) / 100;
  const percentage = budget > 0 ? Math.round((spent / budget) * 10000) / 100 : 0;

  let status = 'NORMAL';
  let severity = 'low';
  let message = `Within budget (${percentage}% used)`;

  if (percentage >= exceededThreshold * 100) {
    status = 'EXCEEDED';
    severity = 'critical';
    const overspent = Math.abs(remaining);
    message = `Budget exceeded by Rs. ${overspent.toLocaleString()} (${percentage}% used)`;
  } else if (percentage >= warningThreshold * 100) {
    status = 'WARNING';
    severity = 'medium';
    message = `High usage: ${percentage}% of budget used (Rs. ${remaining.toLocaleString()} remaining)`;
  }

  return {
    budgetAmount: budget,
    actualSpent: spent,
    remainingAmount: remaining,
    percentageUsed: percentage,
    status,
    severity,
    message,
    isOverBudget: status === 'EXCEEDED',
    isNearBudget: status === 'WARNING',
  };
}

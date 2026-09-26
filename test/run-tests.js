import assert from 'node:assert';
import { validateRegistration, validateLogin } from '../utils/validation/authValidation.js';
import { validateTransactionInput, validateTransactionQuery } from '../utils/validation/transactionValidation.js';
import { validateBudgetInput, validateBudgetQuery } from '../utils/validation/budgetValidation.js';
import { calculateBudgetAlert } from '../utils/analytics/budgetAlerts.js';
import { calculateNetBalance, calculatePercentage, aggregateCategoryBreakdown } from '../utils/analytics/financialCalculations.js';
import { parseAndValidateCsv } from '../utils/csv/csvParser.js';
import { generateCsvFromTransactions } from '../utils/csv/csvGenerator.js';

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

console.log('======================================================');
console.log('  ExpenseMate — Automated Backend Test Suite');
console.log('======================================================\n');

// 1. Authentication Validation Tests
console.log('--- 1. Auth Validation Tests ---');
test('validateRegistration accepts valid registration payload', () => {
  const result = validateRegistration({
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    password: 'password123',
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.data.email, 'ahmed@example.com');
  assert.strictEqual(result.data.name, 'Ahmed Khan');
});

test('validateRegistration rejects invalid email format', () => {
  const result = validateRegistration({
    name: 'Ahmed',
    email: 'not-an-email',
    password: 'password123',
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('valid email')));
});

test('validateRegistration rejects short password (<6 chars)', () => {
  const result = validateRegistration({
    name: 'Ahmed',
    email: 'ahmed@example.com',
    password: '123',
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('at least 6 characters')));
});

test('validateLogin requires email and password', () => {
  const result = validateLogin({ email: '', password: '' });
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.errors.length, 2);
});

// 2. Transaction Validation Tests
console.log('\n--- 2. Transaction Validation Tests ---');
test('validateTransactionInput accepts valid expense payload', () => {
  const result = validateTransactionInput({
    type: 'expense',
    amount: 1500.5,
    category: 'Groceries',
    description: 'Weekly milk and fruits',
    date: '2026-09-26',
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.data.type, 'expense');
  assert.strictEqual(result.data.amount, 1500.5);
  assert.strictEqual(result.data.category, 'Groceries');
});

test('validateTransactionInput rejects negative amount', () => {
  const result = validateTransactionInput({
    type: 'expense',
    amount: -50,
    category: 'Food',
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('positive number')));
});

test('validateTransactionInput rejects invalid transaction type', () => {
  const result = validateTransactionInput({
    type: 'crypto_transfer',
    amount: 500,
    category: 'Investments',
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes("either 'income' or 'expense'")));
});

test('validateTransactionQuery parses search params correctly', () => {
  const params = new URLSearchParams('type=expense&month=9&year=2026&search=car');
  const result = validateTransactionQuery(params);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.filters.type, 'expense');
  assert.strictEqual(result.filters.month, 9);
  assert.strictEqual(result.filters.year, 2026);
  assert.strictEqual(result.filters.search, 'car');
});

// 3. Budget Validation Tests
console.log('\n--- 3. Budget Validation Tests ---');
test('validateBudgetInput accepts valid budget', () => {
  const result = validateBudgetInput({
    category: 'Utilities',
    amount: 15000,
    month: 10,
    year: 2026,
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.data.category, 'Utilities');
  assert.strictEqual(result.data.amount, 15000);
  assert.strictEqual(result.data.month, 10);
  assert.strictEqual(result.data.year, 2026);
});

test('validateBudgetInput rejects invalid month (>12)', () => {
  const result = validateBudgetInput({
    category: 'Utilities',
    amount: 5000,
    month: 13,
    year: 2026,
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('between 1 and 12')));
});

// 4. Budget Alert Calculation Logic
console.log('\n--- 4. Budget Alert Calculations ---');
test('calculateBudgetAlert correctly identifies NORMAL status (<80%)', () => {
  const alert = calculateBudgetAlert(10000, 5000); // 50%
  assert.strictEqual(alert.status, 'NORMAL');
  assert.strictEqual(alert.percentageUsed, 50);
  assert.strictEqual(alert.remainingAmount, 5000);
  assert.strictEqual(alert.isOverBudget, false);
  assert.strictEqual(alert.isNearBudget, false);
});

test('calculateBudgetAlert correctly identifies WARNING status (>=80% and <100%)', () => {
  const alert = calculateBudgetAlert(10000, 8500); // 85%
  assert.strictEqual(alert.status, 'WARNING');
  assert.strictEqual(alert.percentageUsed, 85);
  assert.strictEqual(alert.remainingAmount, 1500);
  assert.strictEqual(alert.isNearBudget, true);
  assert.strictEqual(alert.isOverBudget, false);
});

test('calculateBudgetAlert correctly identifies EXCEEDED status (>=100%)', () => {
  const alert = calculateBudgetAlert(10000, 12500); // 125%
  assert.strictEqual(alert.status, 'EXCEEDED');
  assert.strictEqual(alert.percentageUsed, 125);
  assert.strictEqual(alert.remainingAmount, -2500);
  assert.strictEqual(alert.isOverBudget, true);
});

test('calculateBudgetAlert respects custom threshold override', () => {
  // If threshold set to 0.70 (70%), 75% should trigger WARNING
  const alert = calculateBudgetAlert(10000, 7500, { warningThreshold: 0.70 });
  assert.strictEqual(alert.status, 'WARNING');
});

// 5. Financial & Analytics Logic
console.log('\n--- 5. Financial Analytics Calculations ---');
test('calculateNetBalance returns accurate difference', () => {
  const balance = calculateNetBalance(150000.5, 45000.25);
  assert.strictEqual(balance, 105000.25);
});

test('calculatePercentage handles 0 denominator safely', () => {
  const pct = calculatePercentage(50, 0);
  assert.strictEqual(pct, 0);
});

test('aggregateCategoryBreakdown computes proper percentages', () => {
  const items = [
    { _id: 'groceries', categoryName: 'Groceries', totalAmount: 3000, count: 2 },
    { _id: 'utilities', categoryName: 'Utilities', totalAmount: 7000, count: 1 },
  ];
  const breakdown = aggregateCategoryBreakdown(items, 10000);
  assert.strictEqual(breakdown.length, 2);
  assert.strictEqual(breakdown[0].category, 'Groceries');
  assert.strictEqual(breakdown[0].percentage, 30);
  assert.strictEqual(breakdown[1].category, 'Utilities');
  assert.strictEqual(breakdown[1].percentage, 70);
});

// 6. CSV Parser & Generator Tests
console.log('\n--- 6. CSV Import/Export Tests ---');
test('parseAndValidateCsv correctly parses valid CSV text', () => {
  const csv = `Date,Type,Category,Amount,Description
2026-09-01,income,Salary,120000,"Monthly corporate salary"
2026-09-05,expense,Groceries,4500.50,"Supermarket groceries"
2026-09-10,expense,Fuel,3200,"Petrol refill"`;

  const result = parseAndValidateCsv(csv, 'user123');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.validRecords.length, 3);
  assert.strictEqual(result.invalidRows.length, 0);
  assert.strictEqual(result.validRecords[0].type, 'income');
  assert.strictEqual(result.validRecords[0].amount, 120000);
  assert.strictEqual(result.validRecords[1].amount, 4500.5);
  assert.strictEqual(result.validRecords[2].category, 'Fuel');
});

test('parseAndValidateCsv isolates malformed rows without failing the batch', () => {
  const csv = `Date,Type,Category,Amount,Description
2026-09-01,income,Salary,100000,"Valid salary"
invalid-date,expense,Food,200,"Bad date"
2026-09-05,bad_type,Food,500,"Bad type"
2026-09-06,expense,Food,-400,"Negative amount"
2026-09-07,expense,Bills,1200,"Valid bill"`;

  const result = parseAndValidateCsv(csv, 'user123');
  assert.strictEqual(result.validRecords.length, 2);
  assert.strictEqual(result.invalidRows.length, 3);
  assert.strictEqual(result.invalidRows[0].rowNumber, 3);
  assert.strictEqual(result.invalidRows[1].rowNumber, 4);
  assert.strictEqual(result.invalidRows[2].rowNumber, 5);
});

test('parseAndValidateCsv rejects CSV missing required headers', () => {
  const csv = `Category,Amount,Notes
Food,500,Lunch`;
  const result = parseAndValidateCsv(csv, 'user123');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.validRecords.length, 0);
  assert.ok(result.summary.includes('Missing required CSV headers'));
});

test('generateCsvFromTransactions generates correctly formatted and escaped CSV', () => {
  const transactions = [
    {
      date: new Date('2026-09-01T00:00:00Z'),
      type: 'income',
      category: 'Salary',
      amount: 150000,
      description: 'Monthly, full-time "salary"',
    },
    {
      date: new Date('2026-09-05T00:00:00Z'),
      type: 'expense',
      category: 'Dining Out',
      amount: 4500,
      description: 'Dinner with team',
    },
  ];

  const csv = generateCsvFromTransactions(transactions);
  assert.ok(csv.startsWith('Date,Type,Category,Amount,Description'));
  assert.ok(csv.includes('"Monthly, full-time ""salary"""'));
  assert.ok(csv.includes('Dining Out,4500.00'));
});

console.log('\n======================================================');
console.log(`  Tests Completed: ${passed + failed}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}

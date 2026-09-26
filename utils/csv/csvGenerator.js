/**
 * Generates standard CSV formatted string from an array of transaction objects
 */
export function generateCsvFromTransactions(transactions = []) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];

  function escapeCsvValue(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = [headers.join(',')];

  for (const t of transactions) {
    const formattedDate = t.date instanceof Date
      ? t.date.toISOString().split('T')[0]
      : new Date(t.date).toISOString().split('T')[0];

    const row = [
      escapeCsvValue(formattedDate),
      escapeCsvValue(t.type),
      escapeCsvValue(t.category),
      t.amount !== undefined ? t.amount.toFixed(2) : '0.00',
      escapeCsvValue(t.description || ''),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}

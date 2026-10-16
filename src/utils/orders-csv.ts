import type { OrderRow } from '../dal/orders-dal.js';

const CSV_HEADERS = [
  'id',
  'customer_email',
  'total_amount_cents',
  'type',
  'status',
  'created_at',
];

function escapeCsvValue(value: string | number): string {
  let text = String(value);

  // Prevent spreadsheet formula injection
  if (/^[\t\r\n ]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  // Escape double quotes
  text = text.replace(/"/g, '""');

  // Wrap values containing special characters in quotes
  if (/[",\r\n]/.test(text)) {
    return `"${text}"`;
  }

  return text;
}

export function generateOrdersCsv(orders: OrderRow[]): string {
  const rows = orders.map((order) => [
    order.id,
    order.customer_email,
    order.total_amount,
    order.type,
    order.status,
    order.created_at,
  ]);

  return [
    CSV_HEADERS.join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n') + '\r\n';
}
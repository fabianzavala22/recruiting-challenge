import test from 'node:test';
import assert from 'node:assert/strict';

import { generateOrdersCsv } from '../src/utils/orders-csv.js';
import type { OrderRow } from '../src/dal/orders-dal.js';

test('generateOrdersCsv escapes special characters', () => {
  const orders: OrderRow[] = [
    {
      id: 'order-1',
      merchant_id: 'm_acme',
      customer_email: 'john,"test"@example.com',
      total_amount: 2500,
      type: 'sale',
      status: 'completed',
      created_at: '2026-10-15 12:00:00',
    },
  ];

  const csv = generateOrdersCsv(orders);

  assert.ok(
    csv.includes('"john,""test""@example.com"')
  );
});

test('generateOrdersCsv prevents spreadsheet formula injection', () => {
  const orders: OrderRow[] = [
    {
      id: 'order-2',
      merchant_id: 'm_acme',
      customer_email: '=SUM(1+1)',
      total_amount: 3000,
      type: 'sale',
      status: 'completed',
      created_at: '2026-10-15 12:00:00',
    },
  ];

  const csv = generateOrdersCsv(orders);

  assert.ok(csv.includes("'=SUM(1+1)"));
  assert.ok(!csv.includes(',=SUM(1+1),'));
});
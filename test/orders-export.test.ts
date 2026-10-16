import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import { db, initSchema } from '../src/db.js';
import { authMiddleware } from '../src/auth.js';
import { ordersRouter } from '../src/routes/orders.js';

test('GET /api/orders/export returns CSV for the selected merchant and date range', async () => {
  // 1. Prepare the database
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES
      ('m_export_a', 'Export Merchant A'),
      ('m_export_b', 'Export Merchant B')
  `).run();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, merchant_id, customer_email, total_amount, type, status, created_at
    )
    VALUES (?, ?, ?, ?, 'sale', 'completed', ?)
  `);

  insertOrder.run(
    'export-a-1',
    'm_export_a',
    'alice@example.com',
    2500,
    '2026-10-10 12:00:00'
  );

  insertOrder.run(
    'export-a-2',
    'm_export_a',
    'bob@example.com',
    1800,
    '2026-10-15 23:00:00'
  );

  insertOrder.run(
    'export-a-outside',
    'm_export_a',
    'outside@example.com',
    3000,
    '2026-09-20 12:00:00'
  );

  insertOrder.run(
    'export-b-1',
    'm_export_b',
    'other@example.com',
    9000,
    '2026-10-12 12:00:00'
  );

  // 2. Create a test server
  const app = express();

  app.use('/api/orders', authMiddleware, ordersRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    // 3. Request the CSV export
    const response = await fetch(
      `http://localhost:${address.port}/api/orders/export?from=2026-10-01&to=2026-10-15`,
      {
        headers: {
          'X-Merchant-Id': 'm_export_a',
        },
      }
    );

    // 4. Validate the response
    assert.equal(response.status, 200);

    assert.match(
      response.headers.get('content-type') ?? '',
      /text\/csv/
    );

    const csv = await response.text();

    assert.match(
      csv,
      /id,customer_email,total_amount_cents,type,status,created_at/
    );

    assert.ok(csv.includes('alice@example.com'));
    assert.ok(csv.includes('bob@example.com'));

    assert.ok(!csv.includes('outside@example.com'));
    assert.ok(!csv.includes('other@example.com'));
  } finally {
    server.close();
  }
});

test('GET /api/orders/export rejects invalid date ranges', async () => {
  initSchema();

  const app = express();
  app.use('/api/orders', authMiddleware, ordersRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const invalidRanges = [
      '?from=2026-10-01',
      '?to=2026-10-15',
      '?from=2026-02-30&to=2026-10-15',
      '?from=2026-10-15&to=2026-10-01',
      '?from=abc&to=2026-10-15',
      '?from=2026-10-01&to=invalid',
    ];

    for (const query of invalidRanges) {
      const response = await fetch(
        `http://localhost:${address.port}/api/orders/export${query}`,
        {
          headers: {
            'X-Merchant-Id': 'm_acme',
          },
        }
      );

      assert.equal(response.status, 400);

      const body = await response.json() as {
        error: string;
      };

      assert.equal(body.error, 'invalid_date_range');
    }
  } finally {
    server.close();
  }
});

test('GET /api/orders/export rejects exports exceeding 10000 orders', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES ('m_export_large', 'Large Export Merchant')
  `).run();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, merchant_id, customer_email, total_amount, type, status, created_at
    )
    VALUES (?, ?, ?, ?, 'sale', 'completed', ?)
  `);

  const insertManyOrders = db.transaction(() => {
    for (let i = 1; i <= 10001; i++) {
      insertOrder.run(
        `export-large-${i}`,
        'm_export_large',
        `customer${i}@example.com`,
        1000,
        '2026-10-10 12:00:00'
      );
    }
  });

  insertManyOrders();

  const app = express();
  app.use('/api/orders', authMiddleware, ordersRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/orders/export?from=2026-10-01&to=2026-10-15`,
      {
        headers: {
          'X-Merchant-Id': 'm_export_large',
        },
      }
    );

    assert.equal(response.status, 413);

    const body = await response.json() as {
      error: string;
    };

    assert.equal(body.error, 'export_limit_exceeded');
  } finally {
    server.close();
  }
});
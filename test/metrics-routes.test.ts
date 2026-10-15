import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import { initSchema, db } from '../src/db.js';
import { authMiddleware } from '../src/auth.js';
import { metricsRouter } from '../src/routes/metrics.js';

test('GET /api/metrics/summary uses the shared database', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES ('m_metrics_test', 'Metrics Test Merchant')
  `).run();

  db.prepare(`
    INSERT INTO orders (
      id, merchant_id, customer_email, total_amount, type, status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'metrics-order-1',
    'm_metrics_test',
    'customer@example.com',
    2000,
    'sale',
    'completed'
  );

  const app = express();
  app.use('/api/metrics', authMiddleware, metricsRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/metrics/summary`,
      {
        headers: {
          'X-Merchant-Id': 'm_metrics_test',
        },
      }
    );

    assert.equal(response.status, 200);

    const body = await response.json() as {
      merchant_id: string;
      total_orders: number;
      unique_customers: number;
      avg_order_value_cents: number;
    };

    assert.equal(body.merchant_id, 'm_metrics_test');
    assert.equal(body.total_orders, 1);
    assert.equal(body.unique_customers, 1);
    assert.equal(body.avg_order_value_cents, 2000);
  } finally {
    server.close();
  }
});

test('GET /api/metrics/top-customers returns only current merchant customers', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES
      ('m_metrics_a', 'Merchant A'),
      ('m_metrics_b', 'Merchant B')
  `).run();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, merchant_id, customer_email, total_amount, type, status
    )
    VALUES (?, ?, ?, ?, 'sale', 'completed')
  `);

  insertOrder.run('metrics-a-1', 'm_metrics_a', 'alice@example.com', 3000);
  insertOrder.run('metrics-a-2', 'm_metrics_a', 'alice@example.com', 2000);
  insertOrder.run('metrics-a-3', 'm_metrics_a', 'bob@example.com', 1000);
  insertOrder.run('metrics-b-1', 'm_metrics_b', 'other@example.com', 9000);

  const app = express();
  app.use('/api/metrics', authMiddleware, metricsRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/metrics/top-customers`,
      {
        headers: {
          'X-Merchant-Id': 'm_metrics_a',
        },
      }
    );

    assert.equal(response.status, 200);

    const body = await response.json() as {
      customers: Array<{
        customer_email: string;
        order_count: number;
        total_spent: number;
      }>;
    };

    assert.equal(body.customers.length, 2);

    assert.deepEqual(body.customers[0], {
      customer_email: 'alice@example.com',
      order_count: 2,
      total_spent: 5000,
    });

    assert.deepEqual(body.customers[1], {
      customer_email: 'bob@example.com',
      order_count: 1,
      total_spent: 1000,
    });

    assert.equal(
      body.customers.some(customer => customer.customer_email === 'other@example.com'),
      false
    );
  } finally {
    server.close();
  }
});

test('GET /api/metrics/top-customers uses default limit of 5', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES ('m_metrics_limit', 'Metrics Limit Merchant')
  `).run();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, merchant_id, customer_email, total_amount, type, status
    )
    VALUES (?, ?, ?, ?, 'sale', 'completed')
  `);

  for (let i = 1; i <= 7; i++) {
    insertOrder.run(
      `metrics-limit-${i}`,
      'm_metrics_limit',
      `customer${i}@example.com`,
      i * 1000
    );
  }

  const app = express();
  app.use('/api/metrics', authMiddleware, metricsRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/metrics/top-customers`,
      {
        headers: {
          'X-Merchant-Id': 'm_metrics_limit',
        },
      }
    );

    assert.equal(response.status, 200);

    const body = await response.json() as {
      customers: Array<{
        customer_email: string;
        order_count: number;
        total_spent: number;
      }>;
    };

    assert.equal(body.customers.length, 5);
    assert.equal(body.customers[0].customer_email, 'customer7@example.com');
    assert.equal(body.customers[4].customer_email, 'customer3@example.com');
  } finally {
    server.close();
  }
});
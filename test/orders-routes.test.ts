import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { ordersRouter } from '../src/routes/orders.js';
import { authMiddleware } from '../src/auth.js';
import { initSchema, db } from '../src/db.js';
import { ordersDal } from '../src/dal/orders-dal.js';

const invalidLimits = [
  '-10',
  '0',
  '1.5',
  '101',
  'abc',
  '10abc',
  '',
];

for (const invalidLimit of invalidLimits) {
  test(`GET /api/orders rejects limit=${invalidLimit}`, async () => {
    initSchema();

    const app = express();
    app.use('/api/orders', authMiddleware, ordersRouter);

    const server = app.listen(0);

    try {
      const address = server.address();

      if (!address || typeof address === 'string') {
        throw new Error('Unable to determine server port');
      }

      const response = await fetch(
        `http://localhost:${address.port}/api/orders?limit=${encodeURIComponent(invalidLimit)}`,
        {
          headers: {
            'X-Merchant-Id': 'm_acme',
          },
        },
      );

      assert.equal(response.status, 400);
    } finally {
      server.close();
    }
  });
}

test('GET /api/orders respects a valid limit', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES ('m_test_limit', 'Test Merchant')
  `).run();

  for (let i = 1; i <= 15; i++) {
    ordersDal.create({
      id: `limit-order-${i}`,
      merchant_id: 'm_test_limit',
      customer_email: `customer${i}@example.com`,
      total_amount: 1000,
      type: 'sale',
      status: 'completed',
    });
  }

  const app = express();
  app.use('/api/orders', authMiddleware, ordersRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/orders?limit=10`,
      {
        headers: {
          'X-Merchant-Id': 'm_test_limit',
        },
      },
    );

    assert.equal(response.status, 200);

    const body = await response.json() as {
      orders: Array<{ id: string }>;
    };

    assert.equal(body.orders.length, 10);
  } finally {
    server.close();
  }
});

test('GET /api/orders uses default limit when omitted', async () => {
  initSchema();

  db.prepare(`
    INSERT OR IGNORE INTO merchants (id, name)
    VALUES ('m_default_limit', 'Default Limit Merchant')
  `).run();

  for (let i = 1; i <= 105; i++) {
    ordersDal.create({
      id: `default-order-${i}`,
      merchant_id: 'm_default_limit',
      customer_email: `customer${i}@example.com`,
      total_amount: 1000,
      type: 'sale',
      status: 'completed',
    });
  }

  const app = express();
  app.use('/api/orders', authMiddleware, ordersRouter);

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine server port');
    }

    const response = await fetch(
      `http://localhost:${address.port}/api/orders`,
      {
        headers: {
          'X-Merchant-Id': 'm_default_limit',
        },
      },
    );

    assert.equal(response.status, 200);

    const body = await response.json() as {
      orders: Array<{ id: string }>;
    };

    assert.equal(body.orders.length, 100);

    const maxLimitResponse = await fetch(
  `http://localhost:${address.port}/api/orders?limit=100`,
  {
    headers: {
      'X-Merchant-Id': 'm_default_limit',
    },
  },
);

assert.equal(maxLimitResponse.status, 200);

const maxLimitBody = await maxLimitResponse.json() as {
  orders: Array<{ id: string }>;
};

assert.equal(maxLimitBody.orders.length, 100);
  } finally {
    server.close();
  }
});
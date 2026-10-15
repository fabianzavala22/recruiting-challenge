import { Router } from 'express';
import { ordersDal } from '../dal/orders-dal.js';
import { randomUUID } from 'node:crypto';

export const ordersRouter = Router();

ordersRouter.get('/', (req, res) => {
  const rawLimit = req.query.limit;
  const DEFAULT_LIMIT = 100;
  const MAX_LIMIT = 100;

  let limit = DEFAULT_LIMIT;

  if (rawLimit !== undefined) {
    if (
      typeof rawLimit !== 'string' ||
      !/^\d+$/.test(rawLimit)
    ) {
      res.status(400).json({ error: 'invalid_limit' });
      return;
    }

    limit = Number(rawLimit);

    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > MAX_LIMIT
    ) {
      res.status(400).json({ error: 'invalid_limit' });
      return;
    }
  }

  const orders = ordersDal.listByMerchant(req.merchantId!, {
    from: typeof req.query.from === 'string' ? req.query.from : undefined,
    to: typeof req.query.to === 'string' ? req.query.to : undefined,
    limit,
  });

  res.json({ orders });
});

ordersRouter.get('/:id', (req, res) => {
  const order = ordersDal.getById(req.params.id, req.merchantId!);
  if (!order) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ order });
});

ordersRouter.post('/', (req, res) => {
  const body = req.body as {
    customer_email?: string;
    total_amount?: number;
    type?: 'sale' | 'refund';
  };
  if (!body.customer_email || typeof body.total_amount !== 'number') {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const order = ordersDal.create({
    id: randomUUID(),
    merchant_id: req.merchantId!,
    customer_email: body.customer_email,
    total_amount: body.total_amount,
    type: body.type ?? 'sale',
    status: 'completed',
  });
  res.status(201).json({ order });
});

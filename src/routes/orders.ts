import { Router } from 'express';
import { ordersDal } from '../dal/orders-dal.js';
import { randomUUID } from 'node:crypto';
import { generateOrdersCsv } from '../utils/orders-csv.js';

export const ordersRouter = Router();

const MAX_EXPORT_ROWS = 10000;

ordersRouter.get('/export', (req, res) => {
  const { from, to } = req.query;

  // Both dates are required
  if (
    typeof from !== 'string' ||
    typeof to !== 'string' ||
    !isValidDate(from) ||
    !isValidDate(to) ||
    from > to
  ) {
    res.status(400).json({ error: 'invalid_date_range' });
    return;
  }

  // Include the entire final day
  const fromDate = `${from} 00:00:00`;

  const nextDay = new Date(`${to}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const toExclusive = nextDay.toISOString().slice(0, 10) + ' 00:00:00';

  // Request one extra row to detect oversized exports
  const orders = ordersDal.listForExport(
    req.merchantId!,
    fromDate,
    toExclusive,
    MAX_EXPORT_ROWS + 1
  );

  if (orders.length > MAX_EXPORT_ROWS) {
    res.status(413).json({ error: 'export_limit_exceeded' });
    return;
  }

  const csv = generateOrdersCsv(orders);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="orders-${from}-to-${to}.csv"`
  );

  res.status(200).send(csv);
});

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

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

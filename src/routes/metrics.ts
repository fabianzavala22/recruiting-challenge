import { Router } from 'express';
import { metricsDal } from '../dal/metrics-dal.js';

export const metricsRouter = Router();

metricsRouter.get('/summary', (req, res) => {
  const merchantId = req.merchantId!;
  const summary = metricsDal.getSummary(merchantId);

  res.json({
    merchant_id: merchantId,
    total_orders: summary.totalOrders,
    unique_customers: summary.uniqueCustomers,
    avg_order_value_cents: summary.avgOrderValueCents,
  });
});

metricsRouter.get('/top-customers', (req, res) => {
  const merchantId = req.merchantId!;
  const limit = Number(req.query.limit ?? 5);

  const rows = metricsDal.getTopCustomers(merchantId, limit);

  res.json({ customers: rows });
});
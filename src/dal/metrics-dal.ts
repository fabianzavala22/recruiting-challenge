import { db } from '../db.js';

export interface MetricsSummary {
  totalOrders: number;
  uniqueCustomers: number;
  avgOrderValueCents: number;
}

export interface TopCustomer {
  customer_email: string;
  order_count: number;
  total_spent: number;
}

export const metricsDal = {
  getSummary(merchantId: string): MetricsSummary {
    const totalOrdersRow = db
      .prepare(`SELECT COUNT(*) AS n FROM orders WHERE merchant_id = ?`)
      .get(merchantId) as { n: number };

    const totalCustomersRow = db
      .prepare(`
        SELECT COUNT(DISTINCT customer_email) AS n
        FROM orders
        WHERE merchant_id = ?
      `)
      .get(merchantId) as { n: number };

    const avgOrderRow = db
      .prepare(`
        SELECT COALESCE(AVG(total_amount), 0) AS avg
        FROM orders
        WHERE merchant_id = ?
      `)
      .get(merchantId) as { avg: number };

    return {
      totalOrders: totalOrdersRow.n,
      uniqueCustomers: totalCustomersRow.n,
      avgOrderValueCents: Math.round(avgOrderRow.avg),
    };
  },

  getTopCustomers(merchantId: string, limit: number): TopCustomer[] {
    return db
      .prepare(`
        SELECT
          customer_email,
          COUNT(*) AS order_count,
          SUM(total_amount) AS total_spent
        FROM orders
        WHERE merchant_id = ?
        GROUP BY customer_email
        ORDER BY total_spent DESC
        LIMIT ?
      `)
      .all(merchantId, limit) as TopCustomer[];
  },
};
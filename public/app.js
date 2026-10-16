const select = document.getElementById('merchant-select');
const totalOrdersEl = document.getElementById('total-orders');
const uniqueCustomersEl = document.getElementById('unique-customers');
const avgOrderEl = document.getElementById('avg-order');
const revenue30dEl = document.getElementById('revenue-30d');
const ordersTbody = document.getElementById('orders-tbody');
const exportFromEl = document.getElementById('export-from');
const exportToEl = document.getElementById('export-to');
const downloadCsvButton = document.getElementById('download-csv');
const exportMessageEl = document.getElementById('export-message');

function api(path) {
  return fetch(path, { headers: { 'X-Merchant-Id': select.value } }).then((r) => r.json());
}

function money(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

const today = new Date();
const thirtyDaysAgo = new Date(
  today.getTime() - 30 * 24 * 60 * 60 * 1000
);

exportFromEl.value = isoDate(thirtyDaysAgo);
exportToEl.value = isoDate(today);

async function refresh() {
  const summary = await api('/api/metrics/summary');
  totalOrdersEl.textContent = summary.total_orders ?? '—';
  uniqueCustomersEl.textContent = summary.unique_customers ?? '—';
  avgOrderEl.textContent = money(summary.avg_order_value_cents ?? 0);

  const now = new Date();
  const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const revenue = await api(`/api/revenue?from=${isoDate(thirtyAgo)}&to=${isoDate(now)}`);
  revenue30dEl.textContent = money(revenue.revenue_cents ?? 0);

  const ordersRes = await api('/api/orders?limit=10');
  ordersTbody.innerHTML = '';
  for (const o of ordersRes.orders ?? []) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(o.created_at).toLocaleDateString()}</td>
      <td>${o.customer_email}</td>
      <td>${o.type}</td>
      <td>${money(o.total_amount)}</td>
    `;
    ordersTbody.appendChild(tr);
  }
}

select.addEventListener('change', refresh);
downloadCsvButton.addEventListener('click', downloadCsv);
refresh();

async function downloadCsv() {
  const from = exportFromEl.value;
  const to = exportToEl.value;

  if (!from || !to || from > to) {
    exportMessageEl.textContent = 'Please select a valid date range.';
    return;
  }

  downloadCsvButton.disabled = true;
  exportMessageEl.textContent = '';

  try {
    const params = new URLSearchParams({ from, to });

    const response = await fetch(
      `/api/orders/export?${params.toString()}`,
      {
        headers: {
          'X-Merchant-Id': select.value,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();

      if (error.error === 'export_limit_exceeded') {
        throw new Error('Too many orders. Please select a shorter date range.');
      }

      throw new Error('Unable to export orders.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${from}-to-${to}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    exportMessageEl.textContent = 'CSV downloaded successfully.';
  } catch (error) {
    exportMessageEl.textContent =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
  } finally {
    downloadCsvButton.disabled = false;
  }
}

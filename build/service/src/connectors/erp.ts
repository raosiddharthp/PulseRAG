import { ConnectorResult, FulfilmentStatus } from '../shared/types';

export async function fetchERP(): Promise<ConnectorResult<FulfilmentStatus>> {
  await new Promise((resolve) => setTimeout(resolve, 220));

  const data: FulfilmentStatus[] = [
    { account: 'Acme Corp', status: '3 SKUs delayed', sku: 'SKU-4821', stockLevel: 12, reorderThreshold: 50 },
    { account: 'Brightline', status: 'Stock allocated', sku: 'SKU-2290', stockLevel: 65, reorderThreshold: 30 },
    { account: 'Vertex Systems', status: '1 SKU out-of-stock', sku: 'SKU-7741', stockLevel: 0, reorderThreshold: 25 },
    { account: 'Nova Retail', status: 'All in stock', sku: 'SKU-3318', stockLevel: 88, reorderThreshold: 40 },
  ];

  return {
    data,
    source: 'SAP ERP',
    fetchedAt: new Date().toISOString(),
  };
}

import { ConnectorResult, Deal } from '../shared/types';

export async function fetchCRM(): Promise<ConnectorResult<Deal>> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const data: Deal[] = [
    { account: 'Acme Corp', dealValue: 340000, stage: 'Negotiation', closeDate: 'Mar 31', crmRiskFlag: 'At-risk' },
    { account: 'Brightline', dealValue: 210000, stage: 'Proposal', closeDate: 'Apr 15', crmRiskFlag: 'At-risk' },
    { account: 'Vertex Systems', dealValue: 180000, stage: 'Closing', closeDate: 'Mar 28', crmRiskFlag: 'At-risk' },
    { account: 'Nova Retail', dealValue: 95000, stage: 'Discovery', closeDate: 'May 10', crmRiskFlag: 'Healthy' },
  ];

  return {
    data,
    source: 'Salesforce',
    fetchedAt: new Date().toISOString(),
  };
}

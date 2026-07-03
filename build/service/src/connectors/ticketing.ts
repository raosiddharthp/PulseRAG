import { ConnectorResult, TicketSummary } from '../shared/types';

export async function fetchTicketing(): Promise<ConnectorResult<TicketSummary>> {
  await new Promise((resolve) => setTimeout(resolve, 195));

  const data: TicketSummary[] = [
    { account: 'Acme Corp', openCount: 2, priorityFlag: 'P1' },
    { account: 'Brightline', openCount: 0, priorityFlag: 'none' },
    { account: 'Vertex Systems', openCount: 1, priorityFlag: 'P2' },
    { account: 'Nova Retail', openCount: 0, priorityFlag: 'none' },
  ];

  return {
    data,
    source: 'Jira',
    fetchedAt: new Date().toISOString(),
  };
}

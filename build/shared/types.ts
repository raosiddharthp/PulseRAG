export interface Deal {
  account: string;
  dealValue: number;
  stage: string;
  closeDate: string;
  crmRiskFlag: 'At-risk' | 'Healthy';
}

export interface FulfilmentStatus {
  account: string;
  status: string;
}

export interface TicketSummary {
  account: string;
  openCount: number;
  priorityFlag: string;
}

export interface ConnectorResult<T> {
  data: T[];
  source: string;
  fetchedAt: string;
}

export interface ClassifyResult {
  connectors: ('crm' | 'erp' | 'ticketing')[];
  format: 'table' | 'chart' | 'cards' | 'prose';
  sensitivity: 'high' | 'medium' | 'low';
}

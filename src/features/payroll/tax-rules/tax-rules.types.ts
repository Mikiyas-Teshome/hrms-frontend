export enum TaxRuleStatus {
  active = 'active',
  inactive = 'inactive',
}

export interface TaxBracketResponse {
  id: string;
  minAmount: number;
  maxAmount?: number | null;
  rate: number;
  sortOrder: number;
}

export interface TaxRuleResponse {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: TaxRuleStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  brackets: TaxBracketResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TaxBracketInput {
  minAmount: number;
  maxAmount?: number | null;
  rate: number;
  sortOrder?: number;
}

export interface CreateTaxRuleInput {
  name: string;
  description?: string;
  status?: TaxRuleStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  brackets: TaxBracketInput[];
}

export interface UpdateTaxRuleInput {
  name?: string;
  description?: string;
  status?: TaxRuleStatus;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  brackets?: TaxBracketInput[];
}

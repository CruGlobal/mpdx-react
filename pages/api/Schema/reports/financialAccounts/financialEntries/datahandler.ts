import {
  FinancialAccountEntry,
  FinancialAccountMetaData,
} from 'src/graphql/types.generated';
import { fetchAllData } from 'src/lib/deserializeJsonApi';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import { FinancialAccountEntriesResponse } from '../../../../graphql-rest.page.generated';

export interface FinancialAccountEntriesRest {
  id: string;
  attributes: {
    amount: string;
    code: string;
    currency: string;
    description: string;
    entry_date: string;
    type: string;
  };
  relationships: {
    category: { data: IdType[] };
  };
}

export interface FinancialAccountMetaRest {
  id: string;
  pagination: {
    page: string;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  sort: string;
  filter: string;
  credits: string;
  debits: string;
  difference: string;
  currency: string;
  closing_balance: string;
  opening_balance: string;
}

interface IdType {
  id: string;
  type: string;
}

export const financialAccountEntriesHandler = ({
  data,
  included,
  meta,
}: {
  data: FinancialAccountEntriesRest[];
  included: unknown[];
  meta: FinancialAccountMetaRest;
}): FinancialAccountEntriesResponse => {
  const entries = data.map((item) => {
    return fetchAllData(item, included);
  }) as FinancialAccountEntry[];

  //  Remove pagination as it's not needed since we get all transactions
  const metaData = {} as FinancialAccountMetaData;
  Object.keys(meta).forEach((key) => {
    if (key === 'pagination') {
      return;
    }
    metaData[snakeToCamel(key)] = meta[key];
  });

  return {
    entries,
    metaData,
  };
};

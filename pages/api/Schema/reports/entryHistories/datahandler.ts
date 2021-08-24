import {
  EntryHistoryRest,
  EntryHistoriesGroup,
} from '../../../graphql-rest.page.generated';

export interface EntryHistoriesResponse {
  id: string;
  type: 'reports_entry_histories_periods';
  attributes: {
    closing_balance: string;
    created_at: string;
    credits: string;
    debits: string;
    difference: string;
    end_date: string;
    opening_balance: string;
    start_date: string;
    updated_at: string | null;
    updated_in_db_at: string | null;
  };
  relationships: {
    credit_by_categories: {
      data: [];
    };
    debit_by_categories: {
      data: [];
    };
  };
}

export const createEntryHistoriesGroup = (
  data: EntryHistoriesResponse[],
  financialAccountId: string,
): EntryHistoriesGroup => ({
  financialAccountId,
  entryHistories: data.map((entryHistory) => createEntryHistory(entryHistory)),
});

const createEntryHistory = (
  history: EntryHistoriesResponse,
): EntryHistoryRest => ({
  closingBalance: Number(history.attributes.closing_balance),
  endDate: history.attributes.end_date,
  id: history.id,
});

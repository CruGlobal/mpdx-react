import { createOperation } from '@apollo/client/link/utils';
import { DocumentNode } from 'graphql';
import {
  ContactFiltersDocument,
  ContactsDocument,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GetExpectedMonthlyTotalsDocument } from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { MassActionsUpdateContactsDocument } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import { MassActionsMergeDocument } from 'src/components/Contacts/MassActions/Merge/MassActionsMerge.generated';
import { isNativeOperation } from './link';

describe('isNativeOperation', () => {
  const makeOperation = (document: DocumentNode) =>
    createOperation({}, { query: document });

  it('returns true for native operations', () => {
    expect(isNativeOperation(makeOperation(ContactsDocument))).toBe(true);
    expect(isNativeOperation(makeOperation(ContactFiltersDocument))).toBe(true);
    expect(
      isNativeOperation(makeOperation(MassActionsUpdateContactsDocument)),
    ).toBe(true);
  });

  it('returns false for rest proxy operations', () => {
    expect(
      isNativeOperation(makeOperation(GetExpectedMonthlyTotalsDocument)),
    ).toBe(false);
    expect(isNativeOperation(makeOperation(MassActionsMergeDocument))).toBe(
      false,
    );
  });
});

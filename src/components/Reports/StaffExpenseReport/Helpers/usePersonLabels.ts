import { useCallback, useMemo } from 'react';
import { useHcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { Transaction } from './filterTransactions';

interface UsePersonLabelsOptions {
  /** Skip the HCM lookup, e.g. while the dialog holding the transactions is closed. */
  skip?: boolean;
}

export interface PersonLabels {
  /**
   * Whether these transactions belong to a household of more than one person. A
   * single staff member sees every transaction under their own name, so
   * labelling them would be noise.
   */
  showPerson: boolean;
  /** The name to show for a transaction's person number. */
  getPersonLabel: (personNumber?: string | null) => string;
}

/**
 * Turns the person number SAA tags each transaction with into the name of the
 * person it belongs to. Spouses share a single staff account, so both salaries
 * land in the same fund and the person number is the only thing telling them
 * apart.
 *
 * The `hcm` query returns `[user]`, or `[user, spouse]` for a married couple,
 * which is where both the person numbers and the names come from.
 */
export const usePersonLabels = (
  transactions: Transaction[],
  { skip = false }: UsePersonLabelsOptions = {},
): PersonLabels => {
  // Staff without an HCM record get a NO_PERSON_NUMBER error. That is an
  // expected outcome here, so it shouldn't reach the user as an error snackbar.
  const { data } = useHcmQuery({ skip, context: { suppressErrors: true } });
  const household = data?.hcm;

  const namesByPersonNumber = useMemo(
    () =>
      new Map(
        household?.map(({ staffInfo }) => [
          staffInfo.personNumber,
          staffInfo.preferredName || staffInfo.lastName || '',
        ]),
      ),
    [household],
  );

  const showPerson = useMemo(
    () =>
      (household?.length ?? 0) > 1 &&
      transactions.some((transaction) => transaction.personNumber),
    [household, transactions],
  );

  const getPersonLabel = useCallback(
    (personNumber?: string | null) =>
      (personNumber && namesByPersonNumber.get(personNumber)) || '',
    [namesByPersonNumber],
  );

  return { showPerson, getPersonLabel };
};

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedExcludedFromAppealReasons } from 'src/utils/functions/getLocalizedExcludedFromAppealReasons';
import { ExcludedAppealContactInfoFragment } from '../../List/ContactsList/AppealExcludedContacts.generated';

// The return value doesn't change until `delay` milliseconds have elapsed since the last time `value` changed
export const useGetExcludedReasons = (
  excludedContacts: ExcludedAppealContactInfoFragment[],
  contactID: string,
): string[] => {
  const { t } = useTranslation();
  const [reasons, setReasons] = useState<string[]>([]);

  useEffect(() => {
    if (!excludedContacts.length || !contactID) {
      return;
    }
    const excludedReasons = excludedContacts.find(
      (excludedContact) => excludedContact.contact?.id === contactID,
    )?.reasons;
    if (!excludedReasons) {
      return;
    }
    const localizedExcludedReasons = excludedReasons.map((reason) =>
      getLocalizedExcludedFromAppealReasons(t, reason),
    );
    setReasons(localizedExcludedReasons);
  }, [excludedContacts, contactID]);

  return reasons;
};

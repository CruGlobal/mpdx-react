import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedExcludedFromAppealReasons } from 'src/utils/functions/getLocalizedExcludedFromAppealReasons';
import { ExcludedAppealContactInfoFragment } from '../AppealExcludedContacts.generated';

type UseGetExcludedReasonsProps = {
  excludedContacts: ExcludedAppealContactInfoFragment[];
  contactId: string;
};

export const useGetExcludedReasons = ({
  excludedContacts,
  contactId,
}: UseGetExcludedReasonsProps): string[] => {
  const { t } = useTranslation();

  const reasons = useMemo(() => {
    const excludedReasons = excludedContacts.find(
      (excludedContact) => excludedContact.contact?.id === contactId,
    )?.reasons;
    if (!excludedReasons) {
      return [];
    }
    return excludedReasons.map((reason) =>
      getLocalizedExcludedFromAppealReasons(t, reason),
    );
  }, [excludedContacts, contactId]);

  return reasons;
};

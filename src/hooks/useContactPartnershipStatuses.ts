import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';

export type ContactPartnershipStatus = Record<
  string,
  {
    name: string;
    translated: string;
    phase: PhaseEnum | null;
  }
>;

export type StatusArray = {
  name: string;
  translated: string;
  phase: PhaseEnum | null;
  id: string;
}[];

export const useContactPartnershipStatuses = () => {
  const constants = useApiConstants();
  const { t } = useTranslation();
  const phases = constants?.phases;
  const statuses = constants?.statuses;

  const otherStatuses = {
    NULL: {
      name: 'null',
      translated: t('-- None --'),
      phase: null,
    },
    ACTIVE: {
      name: 'active',
      translated: t('-- All Active --'),
      phase: null,
    },
    HIDDEN: {
      name: 'hidden',
      translated: t('-- All Hidden --'),
      phase: null,
    },
  };

  const contactPartnershipStatus: ContactPartnershipStatus = phases
    ? phases?.reduce((acc, phase) => {
        phase?.contactStatuses?.map((status) => {
          const statusName = statuses?.find(({ id }) => status === id)?.value;
          acc[status] = {
            name: statusName,
            translated: getLocalizedContactStatus(t, status),
            phase: phase.id,
          };
        });
        return acc;
      }, otherStatuses)
    : otherStatuses;

  const statusMap: { [statusKey: string]: string } =
    contactPartnershipStatus &&
    Object.fromEntries(
      Object.entries(contactPartnershipStatus)
        .filter(([_, status]) => status?.phase)
        .map(([statusKey, status]) => [status?.name, statusKey]),
    );

  const statusMapForFilters: { [statusKey: string]: string } =
    Object.fromEntries(
      Object.entries(contactPartnershipStatus).map(([statusKey, status]) => [
        status.name,
        statusKey,
      ]),
    );

  const statusArray = Object.entries(contactPartnershipStatus)
    .filter(([_, status]) => status.phase)
    .map(([statusKey, s]) => {
      return { id: statusKey, ...s };
    });

  return {
    contactPartnershipStatus,
    statusMap,
    statusMapForFilters,
    statusArray,
  };
};

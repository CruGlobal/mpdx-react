import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';

export type ContactStatuses = Record<
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

  const contactStatuses: ContactStatuses = phases
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
    contactStatuses &&
    Object.fromEntries(
      Object.entries(contactStatuses)
        .filter(([_, status]) => status?.phase)
        .map(([statusKey, status]) => [status?.name, statusKey]),
    );

  const statusMapForFilters: { [statusKey: string]: string } =
    Object.fromEntries(
      Object.entries(contactStatuses).map(([statusKey, status]) => [
        status.name,
        statusKey,
      ]),
    );

  const statusArray = Object.entries(contactStatuses)
    .filter(([_, status]) => status.phase)
    .map(([statusKey, s]) => {
      return { id: statusKey, ...s };
    });

  return {
    contactStatuses,
    statusMap,
    statusMapForFilters,
    statusArray,
  };
};

import { useApiConstants } from 'src/components/Constants/UseApiConstants';

export const useGetContactPartnershipStatuses = () => {
  const constants = useApiConstants();
  const phases = constants?.phases;
  const statuses = constants?.statuses;

  return phases?.reduce((acc, phase) => {
    phase?.contactStatuses?.map((status) => {
      const translatedName = statuses?.find(({ id }) => status === id)?.value;
      acc[status] = {
        name: translatedName,
        translated: translatedName,
        phase: phase,
      };
    });
    return acc;
  }, {});
};

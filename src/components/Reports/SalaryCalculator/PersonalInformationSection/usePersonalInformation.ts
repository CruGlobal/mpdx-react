import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const usePersonalInformation = () => {
  const { t } = useTranslation();
  const { hcm } = useSalaryCalculator();

  const [self, spouse] = hcm ?? [];

  const selfStaffInfo = self?.staffInfo;
  const spouseStaffInfo = spouse?.staffInfo;

  const formatLocation = (city?: string | null, state?: string | null) => {
    if (city && state) {
      return `${city}, ${state}`;
    }
    return city ?? state ?? '-';
  };

  const formatYears = (years?: number | null) => {
    if (years === null || years === undefined) {
      return '-';
    }
    return t('{{count}} years', { count: years });
  };

  const selfLocation = formatLocation(
    selfStaffInfo?.city,
    selfStaffInfo?.state,
  );
  const spouseLocation = formatLocation(
    spouseStaffInfo?.city,
    spouseStaffInfo?.state,
  );
  const selfTenure = formatYears(selfStaffInfo?.tenure);
  const spouseTenure = formatYears(spouseStaffInfo?.tenure);
  const selfAge = selfStaffInfo?.age?.toString() ?? '-';
  const spouseAge = spouseStaffInfo?.age?.toString() ?? '-';
  const selfChildren =
    selfStaffInfo?.dependentChildrenWithHealthcareBenefits?.toString() ?? '-';
  const spouseChildren =
    spouseStaffInfo?.dependentChildrenWithHealthcareBenefits?.toString() ?? '-';

  return {
    spouse,
    selfLocation,
    spouseLocation,
    selfTenure,
    spouseTenure,
    selfAge,
    spouseAge,
    selfChildren,
    spouseChildren,
  };
};

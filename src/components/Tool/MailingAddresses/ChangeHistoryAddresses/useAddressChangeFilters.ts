import { useState } from 'react';
import {
  ContactFilterChangedDuringEnum,
  DateRange,
  getChangedDuringRange,
} from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';
import { AddressChangeFilter } from './AddressChangeEmptyState/AddressChangeEmptyState';

const getEmptyStateFilter = (
  otherFilters: boolean,
  changedDuring: ContactFilterChangedDuringEnum | null,
): AddressChangeFilter => {
  if (otherFilters) {
    return 'other';
  }
  if (!changedDuring) {
    return 'none';
  }
  return changedDuring === ContactFilterChangedDuringEnum.Last12Months
    ? 'defaultRange'
    : 'other';
};

export const useAddressChangeFilters = () => {
  const [partners, setPartners] = useState(
    ContactFilterPartnerEnum.GaveOneOrMore,
  );
  const [changedDuring, setChangedDuring] =
    useState<ContactFilterChangedDuringEnum | null>(
      ContactFilterChangedDuringEnum.Last12Months,
    );
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [madeBy, setMadeBy] = useState<string | null>(null);
  const dateRange = getChangedDuringRange(changedDuring, customRange);
  const emptyStateFilter = getEmptyStateFilter(
    partners !== ContactFilterPartnerEnum.GaveOneOrMore || !!madeBy,
    changedDuring,
  );

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
    setChangedDuring(ContactFilterChangedDuringEnum.Custom);
  };

  return {
    partners,
    setPartners,
    changedDuring,
    setChangedDuring,
    customRange,
    handleCustomRangeChange,
    madeBy,
    setMadeBy,
    dateRange,
    emptyStateFilter,
  };
};

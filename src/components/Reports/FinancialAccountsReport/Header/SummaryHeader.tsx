import React from 'react';
import { HeaderTopDetails } from './HeaderTopDetails';
import { StickyHeader } from './styledComponents';

interface SummaryHeaderProps {
  accountListId: string;
  financialAccountId: string;
  handleNavListToggle: () => void;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  accountListId,
  financialAccountId,
  handleNavListToggle,
}) => {
  return (
    <StickyHeader
      p={2}
      data-testid="FinancialAccountHeader"
      onTransactionPage={false}
    >
      <HeaderTopDetails
        accountListId={accountListId}
        financialAccountId={financialAccountId}
        handleNavListToggle={handleNavListToggle}
      />
    </StickyHeader>
  );
};

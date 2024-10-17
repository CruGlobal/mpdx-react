import React from 'react';
import { HeaderTopDetails } from './HeaderTopDetails';
import { StickyHeader } from './styledComponents';

interface FinancialAccountSummaryHeaderProps {
  accountListId: string;
  financialAccountId: string;
  handleNavListToggle: () => void;
}

export const FinancialAccountSummaryHeader: React.FC<
  FinancialAccountSummaryHeaderProps
> = ({ accountListId, financialAccountId, handleNavListToggle }) => {
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

import React from 'react';
import { Box } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Fund } from 'src/graphql/types.generated';
import { BalanceCard } from '../BalanceCard/BalanceCard';
import { BalanceCardSkeleton } from '../BalanceCard/BalanceCardSkeleton';
import {
  getIconColorForFundType,
  getIconForFundType,
} from '../Helpers/fundTypeHelpers';

const StyledCardsBox = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 240,
  display: 'flex',
  gap: theme.spacing(4),
}));

export interface BalanceCardListProps {
  funds: Fund[];
  selectedFundType: string | null;
  transferTotals: Record<string, { in: number; out: number }>;
  onCardClick: (fundType: string) => void;
  loading: boolean;
}

export const BalanceCardList: React.FC<BalanceCardListProps> = ({
  funds,
  selectedFundType,
  transferTotals,
  onCardClick,
  loading,
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <StyledCardsBox>
        <BalanceCardSkeleton />
        <BalanceCardSkeleton />
        <BalanceCardSkeleton />
      </StyledCardsBox>
    );
  }

  return (
    <>
      {funds.map((fund) => (
        <StyledCardsBox key={fund.fundType}>
          <BalanceCard
            fundType={fund.fundType}
            icon={getIconForFundType(fund.fundType)}
            iconBgColor={getIconColorForFundType(fund.fundType, theme)}
            title={fund.fundType}
            isSelected={selectedFundType === fund.fundType}
            startingBalance={fund.startingBalance ?? 0}
            endingBalance={fund.endingBalance ?? 0}
            transfersIn={transferTotals[fund.fundType]?.in}
            transfersOut={transferTotals[fund.fundType]?.out}
            onClick={onCardClick}
          />
        </StyledCardsBox>
      ))}
    </>
  );
};

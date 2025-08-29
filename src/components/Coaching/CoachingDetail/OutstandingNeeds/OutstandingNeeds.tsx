import React from 'react';
import {
  Box,
  CardHeader,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum } from '../CoachingDetail';
import {
  AlignedTableCell,
  ContentContainer,
  LoadMoreButton,
} from '../styledComponents/styledComponents';
import {
  useLoadAccountListCoachingNeedsQuery,
  useLoadCoachingNeedsQuery,
} from './OutstandingNeeds.generated';

interface OutstandingNeedsProps {
  accountListId: string;
  // Whether the account list belongs to the user or someone that the user coaches
  accountListType: AccountListTypeEnum;
}

export const OutstandingNeeds: React.FC<OutstandingNeedsProps> = ({
  accountListId,
  accountListType,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    data: ownData,
    loading: ownLoading,
    fetchMore: ownFetchMore,
  } = useLoadAccountListCoachingNeedsQuery({
    variables: { accountListId },
    skip: accountListType !== AccountListTypeEnum.Own,
  });

  const {
    data: coachingData,
    loading: coachingLoading,
    fetchMore: coachingFetchMore,
  } = useLoadCoachingNeedsQuery({
    variables: { coachingAccountListId: accountListId },
    skip: accountListType !== AccountListTypeEnum.Coaching,
  });

  const loading =
    accountListType === AccountListTypeEnum.Own ? ownLoading : coachingLoading;
  const fetchMore =
    accountListType === AccountListTypeEnum.Own
      ? ownFetchMore
      : coachingFetchMore;
  const pledges =
    accountListType === AccountListTypeEnum.Own
      ? ownData?.accountListPledges
      : coachingData?.coachingAccountListPledges;

  const checkDueDate = (
    expectedDate: string | null | undefined,
  ): { color: string; overdue: string } => {
    if (expectedDate) {
      const start = DateTime.fromISO(expectedDate);
      const end = DateTime.now();

      const months = Math.round(end.diff(start, 'months').months);
      const years = Math.round(end.diff(start, 'years').years);

      let color = '',
        overdue = '';

      if (months >= 12) {
        color = theme.palette.statusDanger.main;
        overdue =
          years === 1
            ? `(${t('1 year ago')})`
            : `(${t('{{years}} years ago', { years })})`;
      } else if (months > 0) {
        color = theme.palette.statusWarning.main;
        overdue =
          months === 1
            ? `(${t('1 month ago')})`
            : `(${t('{{months}} months ago', { months })})`;
      }

      return { color, overdue };
    } else {
      const color = '',
        overdue = t('Start Date Not Set');
      return { color, overdue };
    }
  };

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t('Outstanding Special Needs')}</Box>
            {pledges?.pageInfo.hasNextPage && (
              <LoadMoreButton
                role="button"
                variant="outlined"
                onClick={() =>
                  fetchMore({
                    variables: {
                      after: pledges?.pageInfo.endCursor,
                    },
                  })
                }
              >
                {t('Load More')}
              </LoadMoreButton>
            )}
          </Box>
        }
      />
      <ContentContainer>
        {loading && !pledges ? (
          <MultilineSkeleton lines={8} />
        ) : (
          <TableContainer sx={{ minWidth: 600 }}>
            <Table size="small" data-testid="OutstandingNeeds">
              <TableHead>
                <TableRow>
                  <AlignedTableCell>{t('Name')}</AlignedTableCell>
                  <AlignedTableCell>{t('Amount')}</AlignedTableCell>
                  <AlignedTableCell>{t('Expected Date')}</AlignedTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pledges?.nodes.map((need) => (
                  <TableRow role="row" key={need.id}>
                    <AlignedTableCell>{need.contact.name}</AlignedTableCell>
                    <AlignedTableCell>
                      {need.amount
                        ? currencyFormat(
                            need.amount,
                            need.amountCurrency || 'USD',
                            locale,
                          )
                        : t('N/A')}
                    </AlignedTableCell>
                    <AlignedTableCell
                      sx={{
                        color: checkDueDate(need.expectedDate).color,
                      }}
                    >
                      {need.expectedDate &&
                        dateFormatShort(
                          DateTime.fromISO(need.expectedDate),
                          locale,
                        )}{' '}
                      {checkDueDate(need.expectedDate).overdue}
                    </AlignedTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ContentContainer>
    </AnimatedCard>
  );
};

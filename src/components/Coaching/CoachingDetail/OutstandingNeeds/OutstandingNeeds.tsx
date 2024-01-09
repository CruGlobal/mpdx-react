import React from 'react';
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum } from '../CoachingDetail';
import {
  useLoadAccountListCoachingNeedsQuery,
  useLoadCoachingNeedsQuery,
} from './OutstandingNeeds.generated';

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

const AlignedTableCell = styled(TableCell)({
  border: 'none',
  textAlign: 'right',
  ':first-of-type': {
    textAlign: 'unset',
  },
});

const LoadMoreButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));
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
  const accountListData =
    accountListType === AccountListTypeEnum.Own
      ? ownData?.accountList
      : coachingData?.coachingAccountList;

  const getColor = (dateString: string): string | undefined => {
    if (dateString.includes('year')) {
      return theme.palette.statusDanger.main;
    } else if (dateString.includes('month')) {
      return theme.palette.statusWarning.main;
    }
  };

  const getDueDate = (expectedDate: string): string => {
    const start = DateTime.fromISO(expectedDate);
    const end = DateTime.now();

    const months = Math.round(end.diff(start, 'months').months);
    const years = Math.round(end.diff(start, 'years').years);

    let time;

    if (months >= 12) {
      time =
        years === 1 ? t('1 year ago') : t('{{years}} years ago', { years });
    } else if (months > 0) {
      time =
        months === 1
          ? t('1 month ago')
          : t('{{months}} months ago', { months });
    }

    return time ? `(${time})` : '';
  };

  const getPledgeDate = (pledgeStartDate: string | null | undefined): string =>
    pledgeStartDate ? getDueDate(pledgeStartDate) : t('Start Date Not Set');

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t('Outstanding Special Needs')}</Box>
            {accountListData?.primaryAppeal?.pledges.pageInfo.hasNextPage && (
              <LoadMoreButton
                role="button"
                variant="outlined"
                onClick={() =>
                  fetchMore({
                    variables: {
                      after:
                        accountListData?.primaryAppeal?.pledges.pageInfo
                          .endCursor,
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
        {loading && !accountListData ? (
          <MultilineSkeleton lines={8} data-testid="Line" />
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
                {accountListData?.primaryAppeal?.pledges.nodes.map((need) => (
                  <TableRow key={need.id}>
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
                        color: getColor(getPledgeDate(need.expectedDate)),
                      }}
                    >
                      {`${
                        need.expectedDate
                          ? dateFormatShort(
                              DateTime.fromISO(need.expectedDate),
                              locale,
                            )
                          : ''
                      } ${getPledgeDate(need.expectedDate)}`}
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

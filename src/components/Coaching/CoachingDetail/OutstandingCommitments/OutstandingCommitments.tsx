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
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum } from '../CoachingDetail';
import {
  useLoadAccountListCoachingCommitmentsQuery,
  useLoadCoachingCommitmentsQuery,
} from './OutstandingCommitments.generated';

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

interface OutstandingCommitmentsProps {
  accountListId: string;
  // Whether the account list belongs to the user or someone that the user coaches
  accountListType: AccountListTypeEnum;
}

export const OutstandingCommitments: React.FC<OutstandingCommitmentsProps> = ({
  accountListId,
  accountListType,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    data: ownData,
    loading: ownLoading,
    fetchMore: ownFetchMore,
  } = useLoadAccountListCoachingCommitmentsQuery({
    variables: { accountListId },
    skip: accountListType !== AccountListTypeEnum.Own,
  });

  const {
    data: coachingData,
    loading: coachingLoading,
    fetchMore: coachingFetchMore,
  } = useLoadCoachingCommitmentsQuery({
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
            <Box flex={1}>{t('Outstanding Recurring Commitments')}</Box>
            {accountListData?.contacts.pageInfo.hasNextPage && (
              <LoadMoreButton
                role="button"
                variant="outlined"
                onClick={() =>
                  fetchMore({
                    variables: {
                      after: accountListData?.contacts.pageInfo.endCursor,
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
            <Table size="small" data-testid="OutstandingCommitment">
              <TableHead>
                <TableRow>
                  <AlignedTableCell>{t('Name')}</AlignedTableCell>
                  <AlignedTableCell>{t('Amount')}</AlignedTableCell>
                  <AlignedTableCell>{t('Frequency')}</AlignedTableCell>
                  <AlignedTableCell>{t('Expected Date')}</AlignedTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountListData?.contacts.nodes.map((contact) => (
                  <TableRow key={contact.id}>
                    <AlignedTableCell>{contact.name}</AlignedTableCell>
                    <AlignedTableCell>
                      {contact.pledgeAmount
                        ? currencyFormat(
                            contact.pledgeAmount,
                            contact.pledgeCurrency || 'USD',
                            locale,
                          )
                        : t('N/A')}
                    </AlignedTableCell>
                    <AlignedTableCell>
                      {contact.pledgeFrequency
                        ? getLocalizedPledgeFrequency(
                            t,
                            contact.pledgeFrequency,
                          )
                        : t('N/A')}
                    </AlignedTableCell>
                    <AlignedTableCell
                      sx={{
                        color: getColor(getPledgeDate(contact.pledgeStartDate)),
                      }}
                    >
                      {`${
                        contact.pledgeStartDate
                          ? dateFormatShort(
                              DateTime.fromISO(contact.pledgeStartDate),
                              locale,
                            )
                          : ''
                      } ${getPledgeDate(contact.pledgeStartDate)}`}
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

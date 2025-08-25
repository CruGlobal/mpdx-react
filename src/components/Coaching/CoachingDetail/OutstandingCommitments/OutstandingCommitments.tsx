import React from 'react';
import {
  Box,
  Button,
  CardHeader,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum } from '../CoachingDetail';
import { AlignedTableCell, ContentContainer } from '../StyledComponents';
import {
  useLoadAccountListCoachingCommitmentsQuery,
  useLoadCoachingCommitmentsQuery,
} from './OutstandingCommitments.generated';

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
  const { getLocalizedPledgeFrequency } = useLocalizedConstants();

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
          <MultilineSkeleton lines={8} />
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
                  <TableRow role="row" key={contact.id}>
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
                        ? getLocalizedPledgeFrequency(contact.pledgeFrequency)
                        : t('N/A')}
                    </AlignedTableCell>
                    <AlignedTableCell
                      sx={{
                        color: checkDueDate(contact.pledgeStartDate)['color'],
                      }}
                    >
                      {`${
                        contact.pledgeStartDate
                          ? dateFormatShort(
                              DateTime.fromISO(contact.pledgeStartDate),
                              locale,
                            )
                          : ''
                      } ${checkDueDate(contact.pledgeStartDate)['overdue']}`}
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

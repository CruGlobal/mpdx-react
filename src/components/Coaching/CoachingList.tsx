import { Box, Divider, styled, Typography } from '@material-ui/core';
import { EcoOutlined } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CoachingRow } from './CoachingRow/CoachingRow';
import {
  CurrentAccountListFragment,
  useLoadCoachingListQuery,
} from './LoadCoachingList.generated';

interface CoachingListProps {
  accountListId: string;
}

const CoachingListWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
}));
const CoachingTitleWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  padding: theme.spacing(2),
  alignItems: 'center',
  alignContent: 'center',
}));

const CoachingTitleIcon = styled(EcoOutlined)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const CoachingListTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: theme.spacing(1),
}));

const CoachingLoading = styled(Skeleton)(() => ({
  width: '75%',
  height: '50px',
}));

export const CoachingList: React.FC<CoachingListProps> = ({
  accountListId,
}) => {
  const { data, loading } = useLoadCoachingListQuery({
    variables: { accountListId: accountListId },
  });
  const { t } = useTranslation();

  const coachingAccounts = data?.coachingAccountLists;

  return (
    <CoachingListWrapper>
      <Divider />
      <CoachingTitleWrapper>
        <CoachingTitleIcon />
        <CoachingListTitle variant="h6">
          {t('Staff You Coach')}
        </CoachingListTitle>
      </CoachingTitleWrapper>
      <Divider />
      <Box>
        {loading && data?.accountList !== null ? (
          <>
            <CoachingLoading role="listitem" />
            <CoachingLoading role="listitem" />
            <CoachingLoading role="listitem" />
          </>
        ) : (
          <>
            <span key={data?.accountList.id} role="listitem">
              <CoachingRow
                coachingAccount={null}
                accountList={data?.accountList as CurrentAccountListFragment}
              />
              <Divider />
            </span>
            {coachingAccounts?.nodes.map((coachingAccount, _index) => {
              return coachingAccount.id !== data?.accountList.id ? (
                <span key={coachingAccount.id} role="listitem">
                  <CoachingRow
                    coachingAccount={coachingAccount}
                    accountList={
                      data?.accountList as CurrentAccountListFragment
                    }
                  />
                  <Divider />
                </span>
              ) : (
                <></>
              );
            })}
          </>
        )}
      </Box>
    </CoachingListWrapper>
  );
};

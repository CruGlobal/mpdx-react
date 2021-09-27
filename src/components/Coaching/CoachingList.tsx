import { Box, Divider, styled, Typography } from '@material-ui/core';
import { EcoOutlined } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CoachingRow } from './CoachingRow/CoachingRow';
import { useLoadCoachingListQuery } from './LoadCoachingList.generated';

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

export const CoachingList = (): ReactElement => {
  const { data, loading } = useLoadCoachingListQuery();
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
        {loading ? (
          <>
            <CoachingLoading />
            <CoachingLoading />
            <CoachingLoading />
          </>
        ) : (
          <>
            {coachingAccounts?.nodes.map((coachingAccount, _index) => {
              return (
                <>
                  <CoachingRow coachingAccount={coachingAccount} />
                  <Divider />
                </>
              );
            })}
          </>
        )}
      </Box>
    </CoachingListWrapper>
  );
};

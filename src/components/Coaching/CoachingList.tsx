import { Box, Divider, Typography } from '@mui/material';
// TODO: This icon is not defined on @mui/icons-material, find replacement.
// import { EcoOutlined } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CoachingRow } from './CoachingRow/CoachingRow';
import { useLoadCoachingListQuery } from './LoadCoachingList.generated';

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

// const CoachingTitleIcon = styled(EcoOutlined)(({ theme }) => ({
//   margin: theme.spacing(1),
// }));

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
  const { data, loading } = useLoadCoachingListQuery();
  const { t } = useTranslation();

  const coachingAccounts = data?.coachingAccountLists;

  return (
    <CoachingListWrapper>
      <Divider />
      <CoachingTitleWrapper>
        {/* <CoachingTitleIcon /> */}
        <CoachingListTitle variant="h6">
          {t('Staff You Coach')}
        </CoachingListTitle>
      </CoachingTitleWrapper>
      <Divider />
      <Box>
        {loading ? (
          <>
            <CoachingLoading role="listitem" />
            <CoachingLoading role="listitem" />
            <CoachingLoading role="listitem" />
          </>
        ) : (
          <>
            {coachingAccounts?.nodes.map((coachingAccount, _index) => {
              return (
                <span key={coachingAccount.id} role="listitem">
                  <CoachingRow
                    coachingAccount={coachingAccount}
                    accountListId={accountListId}
                  />
                  <Divider />
                </span>
              );
            })}
          </>
        )}
      </Box>
    </CoachingListWrapper>
  );
};

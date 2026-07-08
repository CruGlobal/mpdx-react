import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { GoalSettingsForm } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsForm';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { getQueryParam } from 'src/lib/queryParam';

// Padded, full-height scroll container. The Goal Settings form's sticky action
// bar breaks out of this spacing(4) padding, so the padding must stay exactly
// spacing(4) (see GoalSettingsForm).
const ScrollContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
    overflow: 'auto',
  },
}));

export const NsGoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const { query } = useRouter();
  const coachingId = getQueryParam(query, 'coachingId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Coaching Accounts | New Staff Goal Calculator')}`}</title>
      </Head>
      {accountListId && coachingId ? (
        <ScrollContainer>
          <GoalSettingsForm accountListId={coachingId} />
        </ScrollContainer>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default NsGoalCalculatorPage;

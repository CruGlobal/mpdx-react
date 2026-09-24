import React, { useContext } from 'react';
import { getApolloContext } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { getAppName } from 'src/lib/getAppName';

const Bubble = styled(Box)(({ theme }) => ({
  maxWidth: '90%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

interface GreetingProps {
  firstName?: string | null;
}

const Greeting: React.FC<GreetingProps> = ({ firstName }) => {
  const { t } = useTranslation();
  const appName = getAppName();

  return (
    <Bubble>
      <Typography variant="body2">
        {firstName
          ? t(
              "Hi {{firstName}}, I'm your {{appName}} Guide. Ask me how to do anything on this site, or pick a question below to get started.",
              { firstName, appName },
            )
          : t(
              "Hi there, I'm your {{appName}} Guide. Ask me how to do anything on this site, or pick a question below to get started.",
              { appName },
            )}
      </Typography>
    </Bubble>
  );
};

const CachedUserGreeting: React.FC = () => {
  // Every signed-in page already loads the user, so the greeting only reads what is cached
  const { data } = useGetUserQuery({ fetchPolicy: 'cache-only' });
  return <Greeting firstName={data?.user.firstName} />;
};

// The drawer can open on /404 and /500, which have no Apollo provider to read the name from
export const GuideGreeting: React.FC = () => {
  const { client } = useContext(getApolloContext());
  return client ? <CachedUserGreeting /> : <Greeting />;
};

import React, { useContext, useId } from 'react';
import { getApolloContext } from '@apollo/client';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { getAppName } from 'src/lib/getAppName';

const Topics = styled(List)(({ theme }) => ({
  padding: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const TopicButton = styled(ListItemButton)(({ theme }) => ({
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
  },
}));

const PersonBanner = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.action.hover,
}));

interface GreetingProps {
  firstName?: string | null;
  helpDeskUrl: string;
  disabled: boolean;
  onPick: (question: string) => void;
}

const Greeting: React.FC<GreetingProps> = ({
  firstName,
  helpDeskUrl,
  disabled,
  onPick,
}) => {
  const { t } = useTranslation();
  const appName = getAppName();
  const topicsLabelId = useId();
  const personLabelId = useId();
  // Four fit the 640px card without scrolling; each follows a help center article
  const topics = [
    {
      title: t('Connect services'),
      question: t('How do I connect my donation services?'),
      Icon: SyncOutlinedIcon,
    },
    {
      title: t("A contact's page"),
      question: t("What can I do on a contact's page?"),
      Icon: PersonOutlineIcon,
    },
    {
      title: t('Contact stars'),
      question: t('How do I star a contact?'),
      Icon: StarBorderIcon,
    },
    {
      title: t('Contacts views'),
      question: t('How do I switch between the contacts views?'),
      Icon: FilterAltOutlinedIcon,
    },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" component="h3" gutterBottom>
          {firstName
            ? t('Hi {{firstName}}, how can I help?', { firstName })
            : t('Hi there, how can I help?')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Ask me how to do something in {{appName}}, like tracking partners, logging tasks, or connecting your donation services.',
            { appName },
          )}
        </Typography>
      </Box>
      <Box>
        <Typography
          id={topicsLabelId}
          variant="overline"
          component="p"
          color="primary"
          fontWeight="bold"
          lineHeight={2}
          mb={1}
        >
          {t('Popular topics')}
        </Typography>
        <Topics aria-labelledby={topicsLabelId}>
          {topics.map(({ title, question, Icon }, index) => (
            <ListItem
              key={title}
              disablePadding
              divider={index < topics.length - 1}
            >
              <TopicButton disabled={disabled} onClick={() => onPick(question)}>
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <Icon color="primary" />
                </ListItemIcon>
                <ListItemText primary={title} />
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </TopicButton>
            </ListItem>
          ))}
        </Topics>
      </Box>
      <PersonBanner role="group" aria-labelledby={personLabelId}>
        <HelpOutlineIcon sx={{ color: 'text.secondary' }} />
        <Typography id={personLabelId} variant="body2" flexGrow={1}>
          {t('Need a person instead?')}
        </Typography>
        <Link
          href={helpDeskUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="button"
          underline="hover"
          fontWeight="bold"
        >
          {t('Help desk')}
        </Link>
      </PersonBanner>
    </Box>
  );
};

type GuideGreetingProps = Omit<GreetingProps, 'firstName'>;

const CachedUserGreeting: React.FC<GuideGreetingProps> = (props) => {
  // Every signed-in page already loads the user, so the greeting only reads what is cached
  const { data } = useGetUserQuery({ fetchPolicy: 'cache-only' });
  return <Greeting firstName={data?.user.firstName} {...props} />;
};

// The drawer can open on /404 and /500, which have no Apollo provider to read the name from
export const GuideGreeting: React.FC<GuideGreetingProps> = (props) => {
  const { client } = useContext(getApolloContext());
  return client ? <CachedUserGreeting {...props} /> : <Greeting {...props} />;
};

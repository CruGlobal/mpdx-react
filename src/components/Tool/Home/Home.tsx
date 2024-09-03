import React, { ReactElement } from 'react';
import { Box, Grid, Theme } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useGetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ToolName } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/NavMenu';
import { useAccountListId } from '../../../hooks/useAccountListId';
import Tool from './Tool';
import { ToolsListHome } from './ToolsListHome';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  toolIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
    color: theme.palette.cruGrayDark.main,
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  notificationBox: {
    backgroundColor: theme.palette.progressBarYellow.main,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: '25%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
  },
}));

const variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const ToolHome = (): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toolData: { [key: string]: { totalCount: number } } = {
    [ToolName.FixCommitmentInfo]: data?.[ToolName.FixCommitmentInfo] ?? {
      totalCount: 0,
    },
    [ToolName.FixMailingAddresses]: data?.[ToolName.FixMailingAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixSendNewsletter]: data?.[ToolName.FixSendNewsletter] ?? {
      totalCount: 0,
    },
    [ToolName.FixEmailAddresses]: data?.[ToolName.FixEmailAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixPhoneNumbers]: data?.[ToolName.FixPhoneNumbers] ?? {
      totalCount: 0,
    },
    [ToolName.MergeContacts]: data?.[ToolName.MergeContacts] ?? {
      totalCount: 0,
    },
    [ToolName.MergePeople]: data?.[ToolName.MergePeople] ?? { totalCount: 0 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <Box className={classes.outer} data-testid="Home">
        <Grid container spacing={3} className={classes.container}>
          {ToolsListHome.map((tool) => {
            const needsAttention = toolData
              ? toolData[tool.id]?.totalCount > 0
              : false;
            return (
              <Grid item xs={12} sm={6} lg={4} key={tool.tool}>
                <Tool
                  tool={t('{{toolname}}', { toolname: tool.tool })}
                  desc={t('{{tooldesc}}', { tooldesc: tool.desc })}
                  icon={tool.icon}
                  url={tool.url}
                  needsAttention={needsAttention}
                  toolNotifications={
                    toolData[tool.id]?.totalCount < 10
                      ? toolData[tool.id].totalCount
                      : '9+'
                  }
                  loading={loading}
                  toolId={tool.id}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default ToolHome;

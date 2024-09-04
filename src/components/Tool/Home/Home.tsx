import React, { ReactElement } from 'react';
import { Box, Grid, Theme } from '@mui/material';
import { motion } from 'framer-motion';
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
  const accountListId = useAccountListId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toolDataTotalCount: { [key: string]: number } = {
    [ToolName.FixCommitmentInfo]: data?.fixCommitmentInfo.totalCount ?? 0,
    [ToolName.FixMailingAddresses]: data?.fixMailingAddresses.totalCount ?? 0,
    [ToolName.FixSendNewsletter]: data?.fixSendNewsletter.totalCount ?? 0,
    [ToolName.FixEmailAddresses]: data?.fixEmailAddresses.totalCount ?? 0,
    [ToolName.FixPhoneNumbers]: data?.fixPhoneNumbers.totalCount ?? 0,
    [ToolName.MergeContacts]: data?.mergeContacts.totalCount ?? 0,
    [ToolName.MergePeople]: data?.mergePeople.totalCount ?? 0,
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
            const needsAttention = toolDataTotalCount
              ? toolDataTotalCount[tool.id] > 0
              : false;
            return (
              <Grid item xs={12} sm={6} lg={4} key={tool.tool}>
                <Tool
                  tool={tool.tool}
                  desc={tool.desc}
                  icon={tool.icon}
                  url={tool.url}
                  needsAttention={needsAttention}
                  totalCount={toolDataTotalCount[tool.id]}
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
